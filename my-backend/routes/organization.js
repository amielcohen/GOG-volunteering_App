// routes/organizations.js
const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const CityOrganization = require('../models/CityOrganization');

// Add global organization
router.post('/', async (req, res) => {
  const { name, description, type, imageUrl, contactEmail, phone } = req.body;

  if (!name || !type) {
    return res.status(400).json({ message: 'שם וסוג העמותה הם שדות חובה' });
  }

  try {
    const newOrg = new Organization({
      name,
      description,
      type,
      imageUrl,
      contactEmail,
      phone,
      isGlobal: true,
    });

    await newOrg.save();
    res.status(201).json(newOrg);
  } catch (err) {
    console.error('שגיאה בשמירת עמותה:', err);
    res.status(500).json({ message: 'שגיאה בהוספת עמותה' });
  }
});

// Get all global organizations
router.get('/', async (req, res) => {
  try {
    const organizations = await Organization.find({ isGlobal: true });
    res.json(organizations);
  } catch (err) {
    res.status(500).json({ message: 'שגיאה בשליפת עמותות' });
  }
});

// Delete global organization (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const deletedOrg = await Organization.findByIdAndDelete(id);
    if (!deletedOrg) return res.status(404).json({ message: 'עמותה לא נמצאה' });

    await CityOrganization.deleteMany({ organizationId: id });

    res.json({ message: 'העמותה והקישורים העירוניים נמחקו בהצלחה' });
  } catch (err) {
    res.status(500).json({ message: 'שגיאה במחיקת עמותה' });
  }
});

module.exports = router;
