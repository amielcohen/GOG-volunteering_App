const express = require('express');
const City = require('../models/City');
const router = express.Router();

// יצירת עיר חדשה
router.post('/', async (req, res) => {
  try {
    const { name, state, imageUrl } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'יש להזין שם עיר' });
    }

    const city = new City({
      name: name.trim(),
      state: state ? state.trim() : undefined,
      imageUrl: imageUrl ? imageUrl.trim() : '',
    });

    await city.save();
    res.status(201).json(city);
  } catch (error) {
    console.error('Error creating city:', error);
    res.status(400).json({ error: error.message });
  }
});

// עדכון עיר (כולל רשימות מקושרים ופעילים, וגם תמונה)
router.patch('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const city = await City.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!city) return res.status(404).json({ error: 'עיר לא נמצאה' });
    res.json(city);
  } catch (error) {
    console.error('Error updating city:', error);
    res.status(400).json({ error: error.message });
  }
});

// הפעלת עיר
router.patch('/:id/activate', async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );
    if (!city) return res.status(404).json({ error: 'עיר לא נמצאה' });
    res.json(city);
  } catch (error) {
    console.error('Error activating city:', error);
    res.status(400).json({ error: error.message });
  }
});

// השבתת עיר
router.patch('/:id/deactivate', async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!city) return res.status(404).json({ error: 'עיר לא נמצאה' });
    res.json(city);
  } catch (error) {
    console.error('Error deactivating city:', error);
    res.status(400).json({ error: error.message });
  }
});

// שליפת ערים (ברירת מחדל: רק ערים פעילות)
router.get('/', async (req, res) => {
  try {
    const showAll = req.query.showAll === 'true';
    const filter = showAll ? {} : { isActive: true };
    const cities = await City.find(filter);
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: error.message });
  }
});
// שליפת עיר לפי ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const city = await City.findById(id);

    if (!city) {
      return res.status(404).json({ error: 'עיר לא נמצאה' });
    }

    res.json({
      _id: city._id,
      name: city.name,
      state: city.state,
      isActive: city.isActive,
      imageUrl: city.imageUrl,
    });
  } catch (error) {
    console.error('Error fetching city by ID:', error);
    res.status(400).json({ error: 'בקשה לא תקינה' });
  }
});

module.exports = router;
