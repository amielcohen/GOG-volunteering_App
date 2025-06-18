// routes/monthlyStats.js
const express = require('express');
const router = express.Router();
const MonthlyStats = require('../models/MonthlyStats');

// 🔹 קודם כל הארצי
router.get('/leaderboard/all/:year/:month', async (req, res) => {
  const { year, month } = req.params;
  const sortBy =
    req.query.sortBy === 'count' ? 'totalVolunteeringCount' : 'totalMinutes';

  try {
    const stats = await MonthlyStats.find({
      year: parseInt(year),
      month: parseInt(month),
    })
      .sort({ [sortBy]: -1 })
      .limit(10)
      .populate('userId', 'firstName lastName profilePic');

    res.json(stats);
  } catch (error) {
    console.error('Error fetching national leaderboard:', error);
    res.status(500).json({ error: 'שגיאה בשרת' });
  }
});

// 🔹 מחזיר את הטופ 10 מתנדבים בעיר מסוימת לחודש ושנה מסוימים
router.get('/leaderboard/:city/:year/:month', async (req, res) => {
  const { city, year, month } = req.params;
  const sortBy =
    req.query.sortBy === 'count' ? 'totalVolunteeringCount' : 'totalMinutes';

  try {
    const stats = await MonthlyStats.find({
      city,
      year: parseInt(year),
      month: parseInt(month),
    })
      .sort({ [sortBy]: -1 })
      .limit(10)
      .populate('userId', 'firstName lastName profilePic');

    res.json(stats);
  } catch (error) {
    console.error('Error fetching city leaderboard:', error);
    res.status(500).json({ error: 'שגיאה בשרת' });
  }
});

// 🔹 מחזיר את הסטטיסטיקה האישית של משתמש מסוים לחודש ושנה מסוימים
router.get('/user/:userId/:year/:month', async (req, res) => {
  const { userId, year, month } = req.params;

  try {
    const stat = await MonthlyStats.findOne({
      userId,
      year: parseInt(year),
      month: parseInt(month),
    });

    if (!stat) {
      return res.status(404).json({ message: 'לא נמצאה סטטיסטיקה לחודש זה' });
    }

    res.json(stat);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'שגיאה פנימית בשרת' });
  }
});

// 🔹 מחזיר את כל ההיסטוריה של משתמש מסוים (לצורך גרף בפרופיל וכו')
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const stats = await MonthlyStats.find({ userId }).sort({
      year: 1,
      month: 1,
    });
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user history:', error);
    res.status(500).json({ error: 'שגיאה פנימית בשרת' });
  }
});

module.exports = router;
