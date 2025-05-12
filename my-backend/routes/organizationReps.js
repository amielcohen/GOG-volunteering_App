const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const City = require('../models/City');
const Organization = require('../models/Organization');

// ✅ יצירת אחראי עמותה
router.post('/', async (req, res) => {
  const {
    username,
    password,
    email,
    dateOfBirth,
    city, // יכול להיות שם או ID
    cities, // חייב להיות מערך (לפחות אחד) – חובה לפי המודל
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

  if (!cities || !Array.isArray(cities) || cities.length === 0) {
    return res
      .status(400)
      .json({ message: 'יש לציין לפחות עיר אחת עבור אחראי העמותה' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'שם המשתמש כבר קיים' });
    }

    // פתרון תומך: ניתן לשלוח שם או ID, אז נזהה ונמיר לפי הצורך
    let cityId = city;
    if (typeof city === 'string' && city.length < 24) {
      const cityDoc = await City.findOne({ name: city });
      if (!cityDoc)
        return res.status(400).json({ message: 'עיר לא נמצאה לפי שם' });
      cityId = cityDoc._id;
    }

    const newOrgRep = new User({
      username,
      password,
      email,
      dateOfBirth,
      city: cityId,
      cities, // כאן אנו מוסיפים את מערך הערים
      street,
      houseNumber,
      gender,
      firstName,
      lastName,
      role: 'OrganizationRep',
      organization,
    });

    await newOrgRep.save();

    // עדכון העיר הראשית אם צריך
    const cityDoc = await City.findById(cityId);
    if (cityDoc && !cityDoc.activeOrganizations.includes(organization)) {
      cityDoc.activeOrganizations.push(organization);
      await cityDoc.save();
    }

    // עדכון העמותה
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

module.exports = router;
