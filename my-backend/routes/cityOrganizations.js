// routes/cityOrganizations.js
const express = require('express');
const router = express.Router();
const CityOrganization = require('../models/CityOrganization');

// Link global organization to city
router.post('/link', async (req, res) => {
  const { organizationId, city, addedBy } = req.body;

  try {
    const exists = await CityOrganization.findOne({ organizationId, city });
    if (exists)
      return res.status(400).json({ message: 'עמותה כבר משויכת לעיר' });

    const newLink = new CityOrganization({
      organizationId,
      city,
      name: '',
      isLocalOnly: false,
      addedBy,
    });

    await newLink.save();
    res.status(201).json(newLink);
  } catch (err) {
    res.status(500).json({ message: 'שגיאה בקישור עמותה' });
  }
});

// Get all city organizations for a specific city
router.get('/', async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ message: 'עיר לא סופקה' });
  }

  try {
    const results = await CityOrganization.find({ city });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'שגיאה בטעינת עמותות עירוניות' });
  }
});

// Add new local organization
router.post('/local', async (req, res) => {
  const { name, description, city, addedBy, phone, contactEmail, imageUrl } =
    req.body;

  try {
    const newLocal = new CityOrganization({
      name,
      description,
      city,
      contactEmail,
      phone,
      imageUrl,
      addedBy,
      isLocalOnly: true,
    });

    await newLocal.save();
    res.status(201).json(newLocal);
  } catch (err) {
    res.status(500).json({ message: 'שגיאה בהוספת עמותה מקומית' });
  }
});

// Delete local city organization
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const deleted = await CityOrganization.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: 'קישור עירוני לא נמצא' });

    res.json({ message: 'העמותה הוסרה מהרשימה העירונית' });
  } catch (err) {
    res.status(500).json({ message: 'שגיאה במחיקת הקישור העירוני' });
  }
});

module.exports = router;
