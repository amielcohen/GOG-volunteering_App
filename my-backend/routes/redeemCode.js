const express = require('express');
const router = express.Router();
const RedeemCode = require('../models/RedeemCode');
const ShopItem = require('../models/ShopItem');
const City = require('../models/City');

const generateUniqueCode = async () => {
  const allowedCharacters =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!?';
  const length = 12;
  let code;

  do {
    code = Array.from(
      { length },
      () =>
        allowedCharacters[Math.floor(Math.random() * allowedCharacters.length)]
    ).join('');
  } while (await RedeemCode.findOne({ code }));

  return code;
};

// יצירת קוד מימוש חדש
router.post('/', async (req, res) => {
  try {
    const { userId, itemId, cityId } = req.body;

    if (!userId || !itemId || !cityId) {
      return res
        .status(400)
        .json({ error: 'חובה לציין מזהה משתמש, מוצר ועיר' });
    }

    const item = await ShopItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'מוצר לא נמצא' });
    }

    const city = await City.findById(cityId);
    if (!city) {
      return res.status(404).json({ error: 'עיר לא נמצאה' });
    }

    const code = await generateUniqueCode();

    const newCode = new RedeemCode({
      code,
      user: userId,
      item: itemId,
      city: cityId,
    });

    const saved = await newCode.save();

    res.status(201).json(saved);
  } catch (err) {
    console.error('שגיאה ביצירת קוד מימוש:', err.message);
    res.status(500).json({ error: 'שגיאה בשרת בעת יצירת קוד' });
  }
});

// קבלת קודים לפי מזהה משתמש וסטטוס
router.get('/user/:userId', async (req, res) => {
  try {
    const { status } = req.query;
    const { userId } = req.params;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const codes = await RedeemCode.find(query)
      .sort({ createdAt: -1 })
      .populate('user')
      .populate('item')
      .populate('city');
    res.json(codes);
  } catch (err) {
    console.error('שגיאה בשליפת קודים:', err);
    res.status(500).json({ error: 'שגיאה בשליפת הקודים' });
  }
});

module.exports = router;
