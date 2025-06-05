const express = require('express');
const router = express.Router();
const BusinessPartner = require('../models/BusinessPartner');

// יצירת עסק חדש
router.post('/', async (req, res) => {
  try {
    const { city, locationDescription } = req.body;

    if (!city || !locationDescription) {
      return res.status(400).json({ error: 'נא לספק עיר ומיקום' });
    }

    const newBusiness = new BusinessPartner({ city, locationDescription });
    await newBusiness.save();
    res.status(201).json(newBusiness);
  } catch (err) {
    console.error('שגיאה ביצירת עסק:', err);
    res.status(500).json({ error: 'שגיאה ביצירת העסק' });
  }
});

// שליפת כל העסקים לפי עיר
router.get('/by-city/:cityId', async (req, res) => {
  try {
    const { cityId } = req.params;
    const businesses = await BusinessPartner.find({ city: cityId }).sort({
      createdAt: -1,
    });
    res.json(businesses);
  } catch (err) {
    console.error('שגיאה בשליפת עסקים:', err);
    res.status(500).json({ error: 'שגיאה בשליפת העסקים' });
  }
});

// מחיקת עסק לפי מזהה
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BusinessPartner.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'העסק לא נמצא' });
    }
    res.json({ message: 'העסק נמחק בהצלחה' });
  } catch (err) {
    console.error('שגיאה במחיקת עסק:', err);
    res.status(500).json({ error: 'שגיאה במחיקת העסק' });
  }
});

module.exports = router;
