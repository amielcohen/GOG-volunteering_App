const express = require('express');
const router = express.Router();
const User = require('../models/Users');

// ראוט התחברות
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // חיפוש המשתמש במסד הנתונים
    const user = await User.findOne({ username, password });
    if (user) {
      res.status(200).json(user); // מחזיר את המשתמש במידה והוא קיים
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
    city,
    street,
    houseNumber,
    gender,
    firstName,
    lastName,
  } = req.body;

  console.log('Registration request:', req.body);

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'שם המשתמש כבר קיים' });
    }

    const newUser = new User({
      username,
      password,
      email,
      dateOfBirth,
      city,
      street,
      houseNumber,
      gender,
      firstName,
      lastName,
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
    } = req.body;

    if (!_id) {
      return res.status(400).json({ message: 'User id is required' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
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
      },
      { new: true }
    );

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

// ראוט לקבלת פרטי המשתמש לפי מזהה
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
