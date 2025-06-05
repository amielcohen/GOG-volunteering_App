const express = require('express');
const router = express.Router();
const DonationOrganization = require('../models/DonationOrganization');

// שליפת כל העמותות לפי עיר (כולל רק אקטיביות כברירת מחדל)
router.get('/by-city/:cityId', async (req, res) => {
  try {
    const { cityId } = req.params;
    const orgs = await DonationOrganization.find({
      city: cityId,
      active: true,
    }).sort({ createdAt: -1 });
    res.json(orgs);
  } catch (err) {
    console.error('שגיאה בשליפת עמותות:', err);
    res.status(500).json({ error: 'שגיאה בשליפת עמותות לתרומה' });
  }
});

// הוספת עמותה חדשה
router.post('/', async (req, res) => {
  try {
    const { city, name } = req.body;

    if (!city || !name) {
      return res.status(400).json({ error: 'נא לציין עיר ושם עמותה' });
    }

    // בדיקה אם קיימת עמותה לא פעילה עם אותו שם בעיר
    const existingInactive = await DonationOrganization.findOne({
      city,
      name,
      active: false,
    });

    if (existingInactive) {
      existingInactive.active = true;
      await existingInactive.save();
      return res.status(200).json(existingInactive);
    }

    // בדיקה אם קיימת עמותה פעילה כבר
    const existingActive = await DonationOrganization.findOne({
      city,
      name,
      active: true,
    });

    if (existingActive) {
      return res
        .status(400)
        .json({ error: 'עמותה עם שם זה כבר קיימת בעיר זו' });
    }

    // יצירת חדשה
    const newOrg = new DonationOrganization({ city, name });
    await newOrg.save();
    res.status(201).json(newOrg);
  } catch (err) {
    console.error('שגיאה בהוספת עמותה:', err);
    res.status(500).json({ error: 'שגיאה בהוספת עמותה' });
  }
});

// "מחיקת" עמותה - הפיכה ללא אקטיבית
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await DonationOrganization.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'עמותה לא נמצאה' });
    }
    res.json({ message: 'העמותה הוסרה בהצלחה', updated });
  } catch (err) {
    console.error('שגיאה במחיקת עמותה:', err);
    res.status(500).json({ error: 'שגיאה במחיקת עמותה' });
  }
});

module.exports = router;
