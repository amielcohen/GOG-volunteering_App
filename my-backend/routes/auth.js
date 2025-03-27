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
    const { username, password, email, dateOfBirth, city, street, houseNumber } = req.body;
    console.log('Registration request:', req.body);
    try {
      const newUser = new User({
        username,
        password,
        email,
        dateOfBirth,
        city,
        street,
        houseNumber
      });
      await newUser.save();
      console.log('User saved:', newUser);
      res.status(201).json({ message: 'משתמש נרשם בהצלחה' });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: error.message });
    }
  });
  

module.exports = router;
