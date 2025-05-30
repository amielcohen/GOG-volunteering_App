const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const ShopItem = require('../models/ShopItem');

// שליפת חנות לפי מזהה עיר
router.get('/by-city/:cityId', async (req, res) => {
  try {
    const { cityId } = req.params;

    const shop = await Shop.findOne({ city: cityId }).populate('items');
    if (!shop) {
      return res.status(404).json({ error: 'לא נמצאה חנות לעיר זו' });
    }

    res.json(shop);
  } catch (error) {
    console.error('שגיאה בשליפת חנות לפי עיר:', error);
    res.status(500).json({ error: 'שגיאה בשרת בעת שליפת חנות' });
  }
});

// הוספת קטגוריה חדשה
router.post('/:cityId/add', async (req, res) => {
  const name = req.body.name?.trim();
  if (!name) {
    return res.status(400).json({ error: 'חובה להזין שם קטגוריה' });
  }

  try {
    const shop = await Shop.findOne({ city: req.params.cityId });
    if (!shop) return res.status(404).json({ error: 'חנות לא נמצאה' });

    if (shop.categories.includes(name)) {
      return res.status(400).json({ error: 'קטגוריה כבר קיימת' });
    }

    shop.categories.push(name);
    await shop.save();

    res
      .status(201)
      .json({ message: 'קטגוריה נוספה', categories: shop.categories });
  } catch (err) {
    console.error('שגיאה בהוספת קטגוריה:', err.message);
    res.status(500).json({ error: 'שגיאה בשרת' });
  }
});

// שליפת קטגוריות עם מיון וספירה לפי כמות פריטים
router.get('/:cityId/all', async (req, res) => {
  try {
    const shop = await Shop.findOne({ city: req.params.cityId });
    if (!shop) return res.status(404).json({ error: 'חנות לא נמצאה' });

    const categoriesWithCounts = await Promise.all(
      shop.categories.map(async (cat) => {
        const count = await ShopItem.countDocuments({
          city: req.params.cityId,
          categories: cat,
        });
        return { name: cat, count };
      })
    );

    categoriesWithCounts.sort((a, b) => b.count - a.count);
    res.json(categoriesWithCounts);
  } catch (err) {
    console.error('שגיאה בטעינת קטגוריות:', err.message);
    res.status(500).json({ error: 'שגיאה בשרת' });
  }
});

// מחיקת קטגוריה
router.delete('/:cityId/:name', async (req, res) => {
  try {
    const { cityId, name } = req.params;
    const shop = await Shop.findOne({ city: cityId });
    if (!shop) return res.status(404).json({ error: 'חנות לא נמצאה' });

    const count = await ShopItem.countDocuments({
      city: cityId,
      categories: name,
    });

    if (count > 0) {
      return res.status(400).json({
        error: `לא ניתן למחוק – יש ${count} פריטים עם הקטגוריה הזו`,
      });
    }

    shop.categories = shop.categories.filter((cat) => cat !== name);
    await shop.save();

    res.json({ message: 'נמחק בהצלחה' });
  } catch (err) {
    console.error('שגיאה במחיקת קטגוריה:', err.message);
    res.status(500).json({ error: 'שגיאה בשרת' });
  }
});

// עדכון קטגוריה
router.put('/:cityId/:oldName', async (req, res) => {
  const newName = req.body.name?.trim();
  if (!newName) return res.status(400).json({ error: 'יש להזין שם חדש' });

  try {
    const { cityId, oldName } = req.params;
    const shop = await Shop.findOne({ city: cityId });
    if (!shop) return res.status(404).json({ error: 'חנות לא נמצאה' });

    const index = shop.categories.indexOf(oldName);
    if (index === -1)
      return res.status(404).json({ error: 'קטגוריה לא נמצאה' });

    shop.categories[index] = newName;
    await shop.save();

    await ShopItem.updateMany(
      { city: cityId, categories: oldName },
      { $set: { 'categories.$': newName } }
    );

    res.json({ message: 'עודכן בהצלחה', categories: shop.categories });
  } catch (err) {
    console.error('שגיאה בעדכון קטגוריה:', err.message);
    res.status(500).json({ error: 'שגיאה בשרת' });
  }
});

module.exports = router;
