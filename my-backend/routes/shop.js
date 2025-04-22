const express = require('express');
const router = express.Router();
const ShopItem = require('../models/ShopItem');

router.post('/add', async (req, res) => {
  try {
    const newItem = new ShopItem(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error('שגיאה בהוספת פריט:', err.message);
    res.status(500).json({ error: 'אירעה שגיאה בשמירת הפריט' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const items = await ShopItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בטעינת פריטים' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await ShopItem.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'פריט לא נמצא' });
    }
    res.json({ message: 'נמחק בהצלחה' });
  } catch (err) {
    console.error('שגיאה במחיקה:', err.message);
    res.status(500).json({ error: 'שגיאה במחיקה' });
  }
});

module.exports = router;
