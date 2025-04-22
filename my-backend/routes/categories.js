const express = require('express');
const router = express.Router();
const Category = require('../models/Categories');
const ShopItem = require('../models/ShopItem');

router.post('/add', async (req, res) => {
  const name = req.body.name?.trim();

  if (!name) {
    return res.status(400).json({ error: 'חובה להזין שם קטגוריה' });
  }

  const existing = await Category.findOne({ name });
  if (existing) {
    return res.status(400).json({ error: 'קטגוריה בשם זה כבר קיימת' });
  }

  try {
    const newItem = new Category({ name });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error('שגיאה בהוספת קטגוריה:', err.message);
    res.status(500).json({ error: 'אירעה שגיאה בשמירת הקטגוריה' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const categories = await Category.find();

    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const count = await ShopItem.countDocuments({
          categories: cat.name, // assuming products store category names
        });
        return {
          _id: cat._id,
          name: cat.name,
          count,
        };
      })
    );

    // sort
    categoriesWithCounts.sort((a, b) => b.count - a.count);

    res.json(categoriesWithCounts);
  } catch (err) {
    console.error('שגיאה בטעינת הקטגוריות:', err.message);
    res.status(500).json({ error: 'שגיאה בטעינת הקטגוריות' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'קטגוריה לא נמצאה' });
    }

    const count = await ShopItem.countDocuments({
      categories: category.name,
    });

    if (count > 0) {
      return res.status(400).json({
        error: `לא ניתן למחוק את הקטגוריה – היא משויכת ל-${count} פריטים. ערוך את הפריטים הללו ונסה שוב.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'הקטגוריה נמחקה בהצלחה' });
  } catch (err) {
    console.error('שגיאה במחיקה:', err.message);
    res.status(500).json({ error: 'שגיאה במחיקת הקטגוריה' });
  }
});

router.put('/:id', async (req, res) => {
  const name = req.body.name?.trim();
  if (!name) {
    return res.status(400).json({ error: 'יש להזין שם חדש לקטגוריה' });
  }

  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'קטגוריה לא נמצאה' });
    }
    res.json(updated);
  } catch (err) {
    console.error('שגיאה בעדכון:', err.message);
    res.status(500).json({ error: 'שגיאה בעדכון הקטגוריה' });
  }
});

module.exports = router;
