const express = require('express');
const router = express.Router();
const ShopItem = require('../models/ShopItem');
const Shop = require('../models/Shop');

// הוספת פריט חדש לחנות העירונית
router.post('/add', async (req, res) => {
  try {
    const {
      name,
      price,
      quantity,
      level,
      description,
      imageUrl,
      categories,
      city,
    } = req.body;

    if (!name || !price || !quantity || !city) {
      return res
        .status(400)
        .json({ error: 'נא לוודא שכל השדות הדרושים מולאו, כולל עיר' });
    }

    const newItem = new ShopItem({
      name,
      price,
      quantity,
      level: level || 0,
      description: description || '',
      imageUrl: imageUrl || '',
      categories: categories?.length ? categories : ['אחר'],
      city, // מזהה העיר
    });

    const savedItem = await newItem.save();

    const shop = await Shop.findOne({ city });
    if (!shop) {
      return res.status(404).json({ error: 'לא נמצאה חנות לעיר זו' });
    }

    shop.items.push(savedItem._id);
    await shop.save();

    res.status(201).json(savedItem);
  } catch (err) {
    console.error('שגיאה בהוספת פריט לחנות:', err.message);
    res.status(500).json({ error: 'שגיאה בשרת בעת הוספת פריט' });
  }
});

// שליפת כל הפריטים (למטרות ניהול כלליות)
router.get('/all', async (req, res) => {
  try {
    const items = await ShopItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בטעינת פריטים' });
  }
});

// מחיקת פריט לפי מזהה
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await ShopItem.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'פריט לא נמצא' });
    }

    // מסיר את הפריט גם מהחנות (אם קיים)
    await Shop.updateOne(
      { items: req.params.id },
      { $pull: { items: req.params.id } }
    );

    res.json({ message: 'נמחק בהצלחה' });
  } catch (err) {
    console.error('שגיאה במחיקת פריט:', err.message);
    res.status(500).json({ error: 'שגיאה במחיקה' });
  }
});

router.get('/by-city/:cityId/items', async (req, res) => {
  try {
    const { cityId } = req.params;
    const sortDirection = req.query.sort === 'desc' ? -1 : 1;

    const shop = await Shop.findOne({ city: cityId });
    if (!shop) {
      return res.status(404).json({ error: 'לא נמצאה חנות לעיר זו' });
    }

    // שליפת הפריטים המלאים עם מיון לפי level
    const items = await ShopItem.find({ _id: { $in: shop.items } }).sort({
      level: sortDirection,
    });

    res.json(items);
  } catch (error) {
    console.error('שגיאה בשליפת פריטים ממויינים לפי רמה:', error.message);
    res.status(500).json({ error: 'שגיאה בשרת בעת שליפת פריטים' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedItem = await ShopItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: 'פריט לא נמצא' });
    }

    res.json(updatedItem);
  } catch (err) {
    console.error('שגיאה בעדכון פריט:', err);
    res.status(500).json({ error: 'שגיאה בעדכון הפריט' });
  }
});

module.exports = router;
