const express = require('express');
const router = express.Router();
const CityOrganization = require('../models/CityOrganization');
const Organization = require('../models/Organization');

// Link global organization to city
router.post('/link', async (req, res) => {
  const {
    organizationId,
    city,
    addedBy,
    externalRewardAllowed,
    maxRewardPerVolunteering,
  } = req.body;

  try {
    const exists = await CityOrganization.findOne({ organizationId, city });
    if (exists) {
      return res.status(400).json({ message: 'עמותה כבר משויכת לעיר' });
    }

    const org = await Organization.findById(organizationId);
    if (!org) {
      return res.status(404).json({ message: 'עמותה לא נמצאה' });
    }

    const newLink = new CityOrganization({
      organizationId,
      city,
      name: org.name,
      description: org.description,
      contactEmail: org.contactEmail,
      phone: org.phone,
      imageUrl: org.imageUrl,
      type: org.type,
      addedBy,
      isLocalOnly: false,
      externalRewardAllowed: externalRewardAllowed ?? false,
      maxRewardPerVolunteering: maxRewardPerVolunteering ?? 50,
    });

    await newLink.save();

    // עדכון רשימת הערים המקושרות של הארגון
    if (!org.linkedCities.includes(city)) {
      org.linkedCities.push(city);
      await org.save();
    }

    res.status(201).json({ message: 'העמותה קושרה בהצלחה' });
  } catch (err) {
    console.error(err);
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
    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'שגיאה בטעינת עמותות עירוניות' });
  }
});

// Add new local organization
router.post('/local', async (req, res) => {
  const {
    name,
    description,
    city,
    addedBy,
    phone,
    contactEmail,
    imageUrl,
    type,
    tags,
    externalRewardAllowed,
    maxRewardPerVolunteering,
  } = req.body;

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
      type,
      tags,
      externalRewardAllowed: externalRewardAllowed ?? false,
      maxRewardPerVolunteering: maxRewardPerVolunteering ?? 50,
    });

    await newLocal.save();
    res.status(201).json(newLocal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'שגיאה בהוספת עמותה מקומית' });
  }
});

// Update city organization
router.put('/:id', async (req, res) => {
  const {
    name,
    description,
    phone,
    contactEmail,
    imageUrl,
    type,
    tags,
    externalRewardAllowed,
    maxRewardPerVolunteering,
    isActive,
  } = req.body;

  try {
    const id = req.params.id;

    const updated = await CityOrganization.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(description && { description }),
        ...(phone && { phone }),
        ...(contactEmail && { contactEmail }),
        ...(imageUrl && { imageUrl }),
        ...(type && { type }),
        ...(tags && { tags }),
        ...(externalRewardAllowed !== undefined && { externalRewardAllowed }),
        ...(maxRewardPerVolunteering !== undefined && {
          maxRewardPerVolunteering,
        }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'עמותה לא נמצאה לעדכון' });
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'שגיאה בעדכון עמותה' });
  }
});

// Delete city organization (local or linked)
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const deleted = await CityOrganization.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'קישור עירוני לא נמצא' });
    }

    // עדכון רשימת הערים המקושרות של הארגון
    if (deleted.organizationId) {
      const org = await Organization.findById(deleted.organizationId);
      if (org) {
        org.linkedCities = org.linkedCities.filter(
          (c) => c.toString() !== deleted.city.toString()
        );
        await org.save();
      }
    }

    res.status(200).json({ message: 'הקישור העירוני נמחק בהצלחה' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'שגיאה במחיקת קישור עירוני' });
  }
});

module.exports = router;
