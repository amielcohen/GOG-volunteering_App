const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');

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

module.exports = router;
