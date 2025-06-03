const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const City = require('../models/City'); // נדרש כדי למצוא עיר לפי שם

// ראוט התחברות
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password }).populate('city');
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(401).json({ message: 'שם המשתמש או הסיסמה שגויים' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ראוט הרשמה
router.post('/register', async (req, res) => {
  const {
    username,
    password,
    email,
    dateOfBirth,
    city, // יכול להיות ID או שם
    street,
    houseNumber,
    gender,
    firstName,
    lastName,
    role, // אפשרות להגדיר role (ברירת מחדל user)
    organization, // במידה ורלוונטי (למשל OrganizationRep)
  } = req.body;

  console.log('Registration request:', req.body);

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'שם המשתמש כבר קיים' });
    }

    let cityId = city;

    // בדיקה אם הגיע שם ולא ID
    if (typeof city === 'string' && city.length < 24) {
      const cityDoc = await City.findOne({ name: city });
      if (!cityDoc) return res.status(400).json({ message: 'עיר לא נמצאה' });
      cityId = cityDoc._id;
    }

    const newUser = new User({
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
      role: role || 'user', // ברירת מחדל אם לא סופק
      organization: organization || null,
    });

    await newUser.save();
    console.log('User saved:', newUser);
    res.status(201).json({ message: 'משתמש נרשם בהצלחה' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ראוט לעדכון פרופיל המשתמש
router.put('/updateProfile', async (req, res) => {
  try {
    const {
      _id,
      username,
      email,
      dateOfBirth,
      city,
      street,
      houseNumber,
      gender,
      password,
      profilePic,
      firstName,
      lastName,
      role,
      organization,
    } = req.body;

    if (!_id) {
      return res.status(400).json({ message: 'User id is required' });
    }

    // בדיקת כפילות בשם משתמש (אם נשלח)
    if (username) {
      const existing = await User.findOne({ username, _id: { $ne: _id } });
      if (existing) {
        return res.status(400).json({ message: 'שם המשתמש כבר קיים' });
      }
    }

    let cityId = city;

    // המרה של שם עיר ל־ObjectId (אם נשלח string קצר)
    if (typeof city === 'string' && city.length < 24) {
      const cityDoc = await City.findOne({ name: city });
      if (!cityDoc) return res.status(400).json({ message: 'עיר לא נמצאה' });
      cityId = cityDoc._id;
    }

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        username,
        email,
        dateOfBirth,
        city: cityId,
        street,
        houseNumber,
        gender,
        password,
        profilePic,
        firstName,
        lastName,
        ...(role && { role }),
        ...(organization && { organization }),
      },
      { new: true }
    );

    console.log('עדכון משתמש:', updatedUser);

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res
      .status(200)
      .json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: err.message });
  }
});

//איפוס הגוגואים
router.put('/resetGoGs', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'Missing userId' });

  try {
    const updated = await User.findByIdAndUpdate(
      userId,
      { GoGs: 0 },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'GoGs reset' });
  } catch (err) {
    console.error('Reset GoGs error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// בדיקת זמינות שם משתמש
router.get('/checkUsername', async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: 'שם משתמש לא סופק' });
  }

  try {
    const exists = await User.exists({ username });
    res.status(200).json({ exists: !!exists });
  } catch (err) {
    console.error('שגיאה בבדיקת שם משתמש:', err);
    res.status(500).json({ message: 'שגיאה בבדיקת שם משתמש' });
  }
});

// ראוט לקבלת פרטי המשתמש לפי מזהה
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('city')
      .populate('organization');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/organization-reps', async (req, res) => {
  const { cityId, organizationId } = req.query;

  if (!cityId || !organizationId) {
    return res
      .status(400)
      .json({ message: 'requierd cityId and organizationId' });
  }

  try {
    const reps = await User.find({
      role: 'OrganizationRep',
      city: cityId,
      organization: organizationId,
    })
      .populate('city')
      .populate('organization');

    res.status(200).json(reps);
  } catch (err) {
    console.error('שגיאה בשליפת אחראים:', err);
    res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

// מחיקת משתמש לפי ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'המשתמש לא נמצא' });
    }

    res.status(200).json({ message: 'המשתמש נמחק בהצלחה' });
  } catch (err) {
    console.error('שגיאה במחיקת משתמש:', err);
    res.status(500).json({ message: 'שגיאה במחיקה מהשרת' });
  }
});

module.exports = router;
