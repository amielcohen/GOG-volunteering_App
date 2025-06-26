const express = require('express');
const router = express.Router();
const RedeemCode = require('../models/RedeemCode');
const ShopItem = require('../models/ShopItem');
const City = require('../models/City');
const BusinessPartner = require('../models/BusinessPartner');

const generateUniqueCode = async () => {
  const allowedCharacters =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!';
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
      user,
      city: item.city,
      itemId: item._id,
      itemName: item.name,
      deliveryType: item.deliveryType,
      pickupLocation: item.pickupLocation || '',
      donationTarget: item.donationTarget || '',
      donationAmount: item.donationAmount || null,
      status: isDonation ? 'redeemed' : 'pending',
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
      .populate('city');
    res.json(codes);
  } catch (err) {
    console.error('שגיאה בשליפת קודים:', err);
    res.status(500).json({ error: 'שגיאה בשליפת הקודים' });
  }
});

// קבלת תרומות שטרם הועברו לעמותה
router.get('/donations-summary', async (req, res) => {
  try {
    const { cityId, donationTarget } = req.query;

    console.log('cityId:', cityId);
    console.log('donationTarget:', donationTarget);

    if (!cityId || !donationTarget) {
      return res.status(400).json({ error: 'יש לציין עיר ויעד תרומה' });
    }

    const codes = await RedeemCode.find({
      deliveryType: 'donation',
      donationTarget,
      city: cityId,
      donated: false,
    }).populate('user');

    console.log('found donations:', codes.length);
    res.json(codes);
  } catch (err) {
    console.error('❌ שגיאה בשליפת תרומות:', err);
    res.status(500).json({ error: 'שגיאה בשרת' });
  }
});

// איפוס תרומות כנתרמו בפועל
router.post('/reset-donations', async (req, res) => {
  try {
    const { cityId, donationTarget } = req.body;

    const result = await RedeemCode.updateMany(
      {
        deliveryType: 'donation',
        donationTarget,
        city: cityId,
        donated: false,
      },
      { $set: { donated: true } }
    );

    res.json({ updated: result.modifiedCount });
  } catch (err) {
    console.error('שגיאה באיפוס תרומות:', err.message);
    res.status(500).json({ error: 'שגיאה באיפוס התרומות' });
  }
});

// שליפת קוד מימוש לפי קוד
router.get('/by-code/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const redeem = await RedeemCode.findOne({ code });

    if (!redeem) {
      return res.status(404).json({ error: 'קוד לא נמצא' });
    }

    res.json(redeem);
  } catch (err) {
    console.error('שגיאה בשליפת קוד לפי מחרוזת:', err.message);
    res.status(500).json({ error: 'שגיאה בשליפת הקוד' });
  }
});

// עדכון סטטוס קוד ל-redeemed
router.patch('/:id/redeem', async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await RedeemCode.findByIdAndUpdate(
      id,
      {
        status: 'redeemed',
        redeemedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'קוד לא נמצא' });
    }

    res.json(updated);
  } catch (err) {
    console.error('שגיאה בעדכון סטטוס לקוד מימוש:', err.message);
    res.status(500).json({ error: 'שגיאה בעדכון הקוד' });
  }
});

// שליפת קודי מימוש לפי שם העסק והכתובת (pickupLocation)
router.get('/business', async (req, res) => {
  try {
    const { name, address } = req.query;

    if (!name || !address) {
      return res.status(400).json({ error: 'חסר שם עסק או כתובת' });
    }

    const pickupLocation = `${name} - ${address}`;

    const codes = await RedeemCode.find({
      deliveryType: 'pickup',
      pickupLocation,
      status: 'pending',
    })
      .sort({ createdAt: -1 })
      .populate('user')
      .populate('city');

    res.json(codes);
  } catch (err) {
    console.error('שגיאה בשליפת קודים לעסק:', err.message);
    res.status(500).json({ error: 'שגיאה בשרת' });
  }
});

router.get('/by-code-for-business/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { businessName, address } = req.query;

    console.log('code:', code);
    console.log('addred:', address);
    console.log('businessName:', businessName);

    if (!businessName || !address) {
      return res.status(400).json({ message: 'חסר שם עסק או כתובת' });
    }

    const fullPickupLocation = `${businessName} - ${address}`;

    const redeemCode = await RedeemCode.findOne({ code });

    if (!redeemCode) {
      return res.status(404).json({ message: 'קוד לא נמצא' });
    }

    if (redeemCode.deliveryType !== 'pickup') {
      return res.status(403).json({ message: 'קוד זה אינו מיועד לאיסוף' });
    }

    if (redeemCode.pickupLocation !== fullPickupLocation) {
      console.log('fullPickupLocation ', fullPickupLocation);
      console.log('pickupLocation ', redeemCode.pickupLocation);

      return res.status(403).json({ message: 'הקוד אינו שייך לעסק שלך' });
    }

    res.status(200).json(redeemCode);
  } catch (err) {
    console.error('שגיאה בשרת:', err);
    res.status(500).json({ message: 'שגיאה בשרת בעת שליפת קוד' });
  }
});

// ראוט ב־redeemCode.js
router.get('/business-history/:id', async (req, res) => {
  try {
    const business = await BusinessPartner.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: 'בית עסק לא נמצא' });
    }

    const location = `${business.businessName} - ${business.address}`;

    const codes = await RedeemCode.find({
      pickupLocation: location,
      deliveryType: 'pickup',
      status: 'redeemed',
    }).sort({ redeemedAt: -1 });

    res.json(codes);
  } catch (err) {
    console.error('שגיאה בשליפת היסטוריית מימושים:', err.message);
    res.status(500).json({ message: 'שגיאה בשרת' });
  }
});

module.exports = router;
