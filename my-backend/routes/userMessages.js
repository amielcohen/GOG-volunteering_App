const express = require('express');
const router = express.Router();
const UserMessage = require('../models/UserMessage');

// קבלת כל ההודעות של משתמש (כולל נקראות ולא נקראות)
router.get('/:userId', async (req, res) => {
  try {
    const messages = await UserMessage.find({ userId: req.params.userId }).sort(
      { createdAt: -1 }
    );
    res.json(messages);
  } catch (err) {
    console.error('שגיאה בשליפת הודעות:', err.message);
    res.status(500).json({ error: 'שגיאה בשליפת הודעות' });
  }
});

// קבלת הודעות לא נקראות בלבד
router.get('/:userId/unread', async (req, res) => {
  try {
    const messages = await UserMessage.find({
      userId: req.params.userId,
      read: false,
    }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error('שגיאה בשליפת הודעות לא נקראות:', err.message);
    res.status(500).json({ error: 'שגיאה בשליפת הודעות' });
  }
});

// יצירת הודעה חדשה למשתמש
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      title,
      message,
      type = 'info',
      source = 'מערכת',
      expiresAt,
    } = req.body;

    const newMessage = new UserMessage({
      userId,
      title,
      message,
      type,
      source,
      expiresAt,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    console.error('שגיאה ביצירת הודעה:', err.message);
    res.status(500).json({ error: 'שגיאה ביצירת הודעה' });
  }
});

// סימון הודעה כנקראה
router.patch('/:id/read', async (req, res) => {
  try {
    await UserMessage.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'ההודעה סומנה כנקראה' });
  } catch (err) {
    console.error('שגיאה בעדכון ההודעה:', err.message);
    res.status(500).json({ error: 'שגיאה בעדכון ההודעה' });
  }
});

// מחיקת הודעה
router.delete('/:id', async (req, res) => {
  try {
    await UserMessage.findByIdAndDelete(req.params.id);
    res.json({ message: 'ההודעה נמחקה' });
  } catch (err) {
    console.error('שגיאה במחיקת הודעה:', err.message);
    res.status(500).json({ error: 'שגיאה במחיקת הודעה' });
  }
});

module.exports = router;
