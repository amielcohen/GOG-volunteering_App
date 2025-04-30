const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const CityOrganization = require('../models/CityOrganization');

// ראוטר חדש: שליפת עמותות ארציות שלא מקושרות לעיר מסוימת
router.get('/unlinked/:cityId', async (req, res) => {
  const { cityId } = req.params;

  try {
    // שליפת כל העמותות שמקושרות לעיר
    const linked = await CityOrganization.find({ city: cityId }).distinct(
      'organizationId'
    );

    // שליפת עמותות ארציות שלא מקושרות לעיר
    const unlinked = await Organization.find({
      isGlobal: true,
      _id: { $nin: linked },
    });

    res.json(unlinked);
  } catch (err) {
    console.error('שגיאה בשליפת עמותות לא מקושרות:', err);
    res.status(500).json({ message: 'שגיאה בשליפת עמותות' });
  }
});

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
    const organizations = await Organization.find({ isGlobal: true }).populate(
      'activeCities',
      'name'
    );
    res.json(organizations);
  } catch (err) {
    res.status(500).json({ message: 'שגיאה בשליפת עמותות' });
  }
});

// Get single organization by ID with activeCities populated
router.get('/:id', async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id).populate(
      'activeCities',
      'name'
    );

    if (!organization) {
      return res.status(404).json({ message: 'עמותה לא נמצאה' });
    }

    res.json(organization);
  } catch (err) {
    console.error('שגיאה בשליפת עמותה:', err);
    res.status(500).json({ message: 'שגיאה בשרת' });
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
