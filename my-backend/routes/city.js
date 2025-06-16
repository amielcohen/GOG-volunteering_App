const express = require('express');
const City = require('../models/City');
const Shop = require('../models/Shop');
const User = require('../models/Users');
const UserMessage = require('../models/UserMessage');

const router = express.Router();

// יצירת עיר חדשה
router.post('/', async (req, res) => {
  try {
    const { name, state, imageUrl } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'יש להזין שם עיר' });
    }

    const trimmedName = name.trim();

    // יצירת העיר
    const city = new City({
      name: trimmedName,
      state: state ? state.trim() : undefined,
      imageUrl: imageUrl ? imageUrl.trim() : '',
    });

    await city.save();

    // יצירת חנות ריקה עם קישור לעיר החדשה
    const shop = new Shop({
      name: `חנות של ${trimmedName}`,
      city: city._id,
      items: [],
      categories: ['אחר'],
    });

    await shop.save();

    res.status(201).json({ city, shop });
  } catch (error) {
    console.error('Error creating city and shop:', error);
    res.status(400).json({ error: error.message });
  }
});

// עדכון עיר (כולל רשימות מקושרים ופעילים, וגם תמונה)
router.patch('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const city = await City.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!city) return res.status(404).json({ error: 'עיר לא נמצאה' });
    res.json(city);
  } catch (error) {
    console.error('Error updating city:', error);
    res.status(400).json({ error: error.message });
  }
});

// הפעלת עיר
router.patch('/:id/activate', async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );
    if (!city) return res.status(404).json({ error: 'עיר לא נמצאה' });

    try {
      const usersInCity = await User.find({ city: city._id, role: 'user' });

      const notifyAll = usersInCity.map((user) =>
        new UserMessage({
          userId: user._id,
          title: 'העיר חזרה לפעילות ',
          message:
            'העיר שלך חזרה להיות פעילה! עדכונים על התנדבויות חדשות ופריטים בחנות העירונית שוב זמינים.',
          type: 'info',
          source: 'מערכת GOG',
        }).save()
      );
      await Promise.all(notifyAll);
      console.log(
        `[CITY_ACTIVATE] ✅ נשלחו הודעות ל-${usersInCity.length} משתמשים בעיר ${city.name}`
      );
    } catch (notifyErr) {
      console.warn(
        '[CITY_ACTIVATE] ⚠️ שגיאה בשליחת הודעות:',
        notifyErr.message
      );
    }

    res.json(city);
  } catch (error) {
    console.error('Error activating city:', error);
    res.status(400).json({ error: error.message });
  }
});

// השבתת עיר
router.patch('/:id/deactivate', async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!city) return res.status(404).json({ error: 'עיר לא נמצאה' });

    try {
      const usersInCity = await User.find({ city: city._id, role: 'user' });

      const rep = await User.findOne({ city: city._id, role: 'CommunityRep' });
      const repEmail = rep?.email || 'לא ידוע';

      const notifyAll = usersInCity.map((user) =>
        new UserMessage({
          userId: user._id,
          title: 'העיר הושבתה ⛔️',
          message: `העיר שלך אינה פעילה כעת. לא יהיו עדכונים חדשים בחנות או בעמותות ההתנדבות.\nלמידע נוסף ניתן לפנות לאחראי העיר במייל: ${repEmail}`,
          type: 'alert',
          source: 'מערכת GOG',
        }).save()
      );
      await Promise.all(notifyAll);
      console.log(
        `[CITY_DEACTIVATE] ✅ נשלחו הודעות ל-${usersInCity.length} משתמשים בעיר ${city.name}`
      );
    } catch (notifyErr) {
      console.warn(
        '[CITY_DEACTIVATE] ⚠️ שגיאה בשליחת הודעות:',
        notifyErr.message
      );
    }

    res.json(city);
  } catch (error) {
    console.error('Error deactivating city:', error);
    res.status(400).json({ error: error.message });
  }
});

// שליפת ערים (ברירת מחדל: רק ערים פעילות)
router.get('/', async (req, res) => {
  try {
    const showAll = req.query.showAll === 'true';
    const filter = showAll ? {} : { isActive: true };
    const cities = await City.find(filter);
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: error.message });
  }
});

// שליפת מספר ערים לפי מזהים (עבור תצוגה בפרופיל וכו')
router.get('/byIds', async (req, res) => {
  try {
    const rawIds = req.query.ids?.split(',') || [];

    // סינון מזהים חוקיים באורך 24 תווים
    const ids = rawIds.filter(
      (id) => typeof id === 'string' && id.length === 24
    );

    if (ids.length === 0) {
      return res.status(400).json({ error: 'לא סופקו מזהים חוקיים' });
    }

    const cities = await City.find({ _id: { $in: ids } }, 'name');
    res.json(cities);
  } catch (error) {
    console.error('❌ שגיאה בראוט /cities/byIds:', error);
    res.status(500).json({ error: 'שגיאה בשרת בעת שליפת ערים לפי מזהים' });
  }
});
// שליפת עיר לפי ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const city = await City.findById(id);

    if (!city) {
      return res.status(404).json({ error: 'עיר לא נמצאה' });
    }

    res.json({
      _id: city._id,
      name: city.name,
      state: city.state,
      isActive: city.isActive,
      imageUrl: city.imageUrl,
    });
  } catch (error) {
    console.error('Error fetching city by ID:', error);
    res.status(400).json({ error: 'בקשה לא תקינה' });
  }
});

module.exports = router;
