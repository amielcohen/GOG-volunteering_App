const express = require('express');
const router = express.Router();
const UserMessage = require('../models/UserMessage');
const User = require('../models/Users');

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

// שליחה המונית לכל משתמשי העיר
router.post('/send', async (req, res) => {
  const {
    city,
    title,
    message,
    type = 'info',
    sendCoins = false,
    coins = 0,
  } = req.body;

  if (!city || !title || !message) {
    return res.status(400).json({ error: 'נא למלא עיר, כותרת והודעה' });
  }

  try {
    const users = await User.find({ city, role: 'user' });

    const operations = users.map(async (user) => {
      let fullTitle = title;
      let fullMessage = message;

      if (sendCoins && coins > 0) {
        fullTitle = `🎁 ${title}`;
        fullMessage += `\nקיבלת ${coins} גוגואים במתנה!`;
        user.GoGs = (user.GoGs || 0) + coins;
        await user.save();
      }

      const msg = new UserMessage({
        userId: user._id,
        title: fullTitle,
        message: fullMessage,
        type,
        source: 'נציג עירוני',
      });

      await msg.save();
    });

    await Promise.all(operations);

    res.json({ message: 'ההודעה נשלחה בהצלחה', sentCount: users.length });
  } catch (err) {
    console.error('שגיאה בשליחת הודעה עירונית:', err.message);
    res.status(500).json({ error: 'שגיאה בשליחת הודעה עירונית' });
  }
});

// מחיקת כל ההודעות של משתמש
router.delete('/all/:userId', async (req, res) => {
  try {
    await UserMessage.deleteMany({ userId: req.params.userId });
    res.json({ message: 'כל ההודעות נמחקו' });
  } catch (err) {
    console.error('שגיאה במחיקת כל ההודעות:', err.message);
    res.status(500).json({ error: 'שגיאה במחיקת כל ההודעות' });
  }
});

// סימון כל ההודעות כנקראו
router.patch('/all/:userId/read', async (req, res) => {
  try {
    await UserMessage.updateMany({ userId: req.params.userId }, { read: true });
    res.json({ message: 'כל ההודעות סומנו כנקראו' });
  } catch (err) {
    console.error('שגיאה בסימון כל ההודעות כנקראו:', err.message);
    res.status(500).json({ error: 'שגיאה בסימון ההודעות' });
  }
});

module.exports = router;
