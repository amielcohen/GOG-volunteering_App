const express = require('express');
const router = express.Router();
const MonthlyPrize = require('../models/MonthlyPrize');

// יצירת פרסים חדשים
router.post('/', async (req, res) => {
  const { city, month, year, type, prizes } = req.body;

  if (
    !city ||
    month == null ||
    !year ||
    !type ||
    !prizes ||
    prizes.length !== 10
  ) {
    return res
      .status(400)
      .json({ error: 'יש למלא את כל השדות ולספק 10 פרסים בדיוק' });
  }

  try {
    const existing = await MonthlyPrize.findOne({ city, month, year, type });
    if (existing) {
      return res
        .status(409)
        .json({ error: 'כבר קיימים פרסים עבור החודש הזה והסוג הזה' });
    }

    const newPrize = new MonthlyPrize({ city, month, year, type, prizes });
    await newPrize.save();
    res.status(201).json(newPrize);
  } catch (err) {
    console.error('Error creating prize:', err.message);
    res.status(500).json({ error: 'שגיאה ביצירת פרסים' });
  }
});

// שליפה לפי עיר, חודש, שנה וסוג דירוג
router.get('/:cityId/:year/:month/:type', async (req, res) => {
  const { cityId, year, month, type } = req.params;

  try {
    const prize = await MonthlyPrize.findOne({
      city: cityId,
      month,
      year,
      type,
    });

    if (!prize) {
      return res.status(404).json({ message: 'לא נמצאו פרסים לחודש הזה' });
    }

    res.json(prize);
  } catch (err) {
    console.error('Error fetching prize:', err.message);
    res.status(500).json({ error: 'שגיאה בשליפת פרסים' });
  }
});

// עדכון פרסים קיימים
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { prizes } = req.body;

  if (!prizes || prizes.length !== 10) {
    return res.status(400).json({ error: 'יש לספק 10 פרסים בדיוק' });
  }

  try {
    const updated = await MonthlyPrize.findByIdAndUpdate(
      id,
      { prizes },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'רשומת פרסים לא נמצאה' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Error updating prize:', err.message);
    res.status(500).json({ error: 'שגיאה בעדכון פרסים' });
  }
});

module.exports = router;
