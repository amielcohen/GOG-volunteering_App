const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const City = require('../models/City');
const Organization = require('../models/Organization');

// יצירת אחראי עמותה
router.post('/', async (req, res) => {
  const {
    username,
    password,
    email,
    dateOfBirth,
    city, // יכול להיות שם או ID
    street,
    houseNumber,
    gender,
    firstName,
    lastName,
    organization, // חייב להגיע ID של עמותה
  } = req.body;

  console.log('Creating OrganizationRep:', req.body);

  if (!organization) {
    return res.status(400).json({ message: 'חובה לבחור עמותה' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'שם המשתמש כבר קיים' });
    }

    let cityId = city;

    if (typeof city === 'string' && city.length < 24) {
      const cityDoc = await City.findOne({ name: city });
      if (!cityDoc) return res.status(400).json({ message: 'עיר לא נמצאה' });
      cityId = cityDoc._id;
    }

    const newOrgRep = new User({
      username,
      password,
      email,
      dateOfBirth,
      city: cityId,
      street,
      houseNumber,
      gender,
      firstName,
      lastName,
      role: 'OrganizationRep',
      organization,
    });

    await newOrgRep.save();

    // עדכון העיר (activeOrganizations)
    const cityDoc = await City.findById(cityId);
    if (cityDoc && !cityDoc.activeOrganizations.includes(organization)) {
      cityDoc.activeOrganizations.push(organization);
      await cityDoc.save();
    }

    // עדכון העמותה (activeCities)
    const organizationDoc = await Organization.findById(organization);
    if (organizationDoc && !organizationDoc.activeCities.includes(cityId)) {
      organizationDoc.activeCities.push(cityId);
      await organizationDoc.save();
    }

    console.log('OrganizationRep created:', newOrgRep);
    res
      .status(201)
      .json({ message: 'אחראי עמותה נוצר בהצלחה', user: newOrgRep });
  } catch (error) {
    console.error('Error creating OrganizationRep:', error);
    res.status(500).json({ message: error.message });
  }
});

// מחיקת אחראי עמותה
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user || user.role !== 'OrganizationRep') {
      return res.status(404).json({ message: 'אחראי עמותה לא נמצא' });
    }

    const { city, organization } = user;

    await user.deleteOne();

    // בדיקה אם יש עוד אחראי לאותה עמותה באותה עיר
    const otherReps = await User.find({
      role: 'OrganizationRep',
      city: city,
      organization: organization,
    });

    if (otherReps.length === 0) {
      // אין עוד אחראים ➔ צריך להסיר מהפעילים
      const cityDoc = await City.findById(city);
      if (cityDoc) {
        cityDoc.activeOrganizations = cityDoc.activeOrganizations.filter(
          (orgId) => !orgId.equals(organization)
        );
        await cityDoc.save();
      }

      const organizationDoc = await Organization.findById(organization);
      if (organizationDoc) {
        organizationDoc.activeCities = organizationDoc.activeCities.filter(
          (cityId) => !cityId.equals(city)
        );
        await organizationDoc.save();
      }
    }

    res.status(200).json({ message: 'אחראי עמותה נמחק בהצלחה' });
  } catch (error) {
    console.error('Error deleting OrganizationRep:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
