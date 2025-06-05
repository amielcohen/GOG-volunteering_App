const express = require('express');
const router = express.Router();
const ShopItem = require('../models/ShopItem');
const Shop = require('../models/Shop');
const User = require('../models/Users');
const RedeemCode = require('../models/RedeemCode');
const mongoose = require('mongoose');
// הוספת פריט חדש לחנות העירונית
router.post('/add', async (req, res) => {
  try {
    const {
      name,
      price,
      quantity,
      level,
      description,
      imageUrl,
      categories,
      city,
      deliveryType,
      pickupLocation,
      donationTarget,
      donationAmount,
    } = req.body;

    // בדיקת שדות חובה
    if (!name || !price || !quantity || !city || !deliveryType) {
      return res.status(400).json({
        error: 'נא לוודא שכל השדות הדרושים מולאו, כולל סוג פריט ועיר',
      });
    }
    if (deliveryType === 'donation' && typeof donationAmount !== 'number') {
      return res.status(400).json({
        error: 'סכום התרומה חייב להיות מספר',
      });
    }

    // אם נדרש מיקום איסוף – נוודא שהוא קיים
    if (deliveryType === 'pickup' && !pickupLocation) {
      return res
        .status(400)
        .json({ error: 'יש לספק מיקום לאיסוף עבור פריטים מסוג איסוף מהחנות' });
    }

    if (deliveryType === 'donation') {
      if (!donationTarget || !donationAmount) {
        return res.status(400).json({
          error: 'יש לספק יעד תרומה וסכום תרומה עבור פריטים מסוג תרומה',
        });
      }
    }

    const newItem = new ShopItem({
      name,
      price,
      quantity,
      level: level || 0,
      description: description || '',
      imageUrl: imageUrl || '',
      categories: categories?.length ? categories : ['אחר'],
      city,
      deliveryType,
      pickupLocation: deliveryType === 'pickup' ? pickupLocation : '',
      donationTarget: deliveryType === 'donation' ? donationTarget : '',
      donationAmount: deliveryType === 'donation' ? donationAmount : null,
    });

    const savedItem = await newItem.save();

    const shop = await Shop.findOne({ city });
    if (!shop) {
      return res.status(404).json({ error: 'לא נמצאה חנות לעיר זו' });
    }

    shop.items.push(savedItem._id);
    await shop.save();

    res.status(201).json(savedItem);
  } catch (err) {
    console.error('שגיאה בהוספת פריט לחנות:', err.message);
    res.status(500).json({ error: 'שגיאה בשרת בעת הוספת פריט' });
  }
});

// שליפת כל הפריטים (למטרות ניהול כלליות)
router.get('/all', async (req, res) => {
  try {
    const items = await ShopItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בטעינת פריטים' });
  }
});

// מחיקת פריט לפי מזהה
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await ShopItem.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'פריט לא נמצא' });
    }

    // מסיר את הפריט גם מהחנות (אם קיים)
    await Shop.updateOne(
      { items: req.params.id },
      { $pull: { items: req.params.id } }
    );

    res.json({ message: 'נמחק בהצלחה' });
  } catch (err) {
    console.error('שגיאה במחיקת פריט:', err.message);
    res.status(500).json({ error: 'שגיאה במחיקה' });
  }
});

// GET /shop/by-city/:cityId/items
router.get('/by-city/:cityId/items', async (req, res) => {
  try {
    const { cityId } = req.params;
    const { sort = 'level', order = 'asc', category } = req.query;

    const sortField = ['price', 'level'].includes(sort) ? sort : 'level';
    const sortDirection = order === 'desc' ? -1 : 1;

    const shop = await Shop.findOne({ city: cityId });
    if (!shop) {
      return res.status(404).json({ error: 'לא נמצאה חנות לעיר זו' });
    }

    // שליפת כל הפריטים של החנות
    const filter = {
      _id: { $in: shop.items },
      quantity: { $gt: 0 }, // ✅ שלוף רק פריטים עם כמות גדולה מ־0
    };

    // הוספת סינון לפי קטגוריה אם נבחרה
    if (category) {
      filter.categories = category;
    }

    const items = await ShopItem.find(filter).sort({
      [sortField]: sortDirection,
    });

    res.json(items);
  } catch (error) {
    console.error('שגיאה בשליפת פריטים:', error.message);
    res.status(500).json({ error: 'שגיאה בשרת בעת שליפת פריטים' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedItem = await ShopItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: 'פריט לא נמצא' });
    }

    res.json(updatedItem);
  } catch (err) {
    console.error('שגיאה בעדכון פריט:', err);
    res.status(500).json({ error: 'שגיאה בעדכון הפריט' });
  }
});

// שליפת מידע על החנות לפי עיר
router.get('/by-city/:cityId', async (req, res) => {
  try {
    const shop = await Shop.findOne({ city: req.params.cityId });
    if (!shop) {
      return res.status(404).json({ error: 'לא נמצאה חנות לעיר זו' });
    }

    res.json(shop); // כולל: items, categories, וכו'
  } catch (error) {
    console.error('שגיאה בשליפת חנות לפי עיר:', error.message);
    res.status(500).json({ error: 'שגיאה בשרת' });
  }
}); // ודא שמיובא למעלה

// ללא סינון

router.get('/by-city/:cityId/raw-items', async (req, res) => {
  try {
    const { cityId } = req.params;
    console.log('cityId param:', cityId);

    const shop = await Shop.findOne({ city: cityId });
    if (!shop) {
      return res.status(404).json({ error: 'לא נמצאה חנות לעיר זו' });
    }

    // הדפסת תוכן shop.items
    console.log('shop.items:', shop.items);

    // המרה בטוחה של מזהים
    const itemIds = (shop.items || [])
      .filter((id) => id) // מסנן undefined/null
      .map((id) => {
        if (typeof id === 'object' && id.$oid) {
          return new mongoose.Types.ObjectId(id.$oid);
        } else {
          return new mongoose.Types.ObjectId(id);
        }
      });

    const items = await ShopItem.find({ _id: { $in: itemIds } });

    res.json(items);
  } catch (error) {
    console.error('שגיאה בשליפת פריטים raw:', error.message);
    res.status(500).json({ error: 'שגיאה בשרת בעת שליפת פריטים' });
  }
});

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789!?';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

router.post('/purchase/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    const itemId = req.params.id;

    const item = await ShopItem.findById(itemId);
    const user = await User.findById(userId);

    if (!item || !user) {
      return res.status(404).json({ error: 'משתמש או פריט לא נמצא' });
    }

    if (item.quantity <= 0) {
      return res.status(400).json({ error: 'המוצר אזל מהמלאי' });
    }

    if (user.GoGs < item.price) {
      return res.status(400).json({ error: 'אין לך מספיק גוגואים' });
    }

    // עדכון כמויות
    item.quantity -= 1;
    user.GoGs -= item.price;
    await item.save();
    await user.save();

    // יצירת קוד
    const code = generateCode();
    const isDonation = item.deliveryType === 'donation';

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

    await newCode.save();
    res.status(201).json({ code });
  } catch (err) {
    console.error('שגיאה ברכישה:', err);
    res.status(500).json({ error: 'שגיאה ברכישת הפריט' });
  }
});
//בדיקה אם קיים איסוף לפני מחיקת עסק
router.get('/checkPickUp/:cityId', async (req, res) => {
  try {
    const { cityId } = req.params;
    console.log(cityId);

    const shop = await Shop.findOne({ city: cityId });
    if (!shop || !Array.isArray(shop.items) || shop.items.length === 0) {
      return res.json([]); // ✅ מחזיר מערך ריק במקום שגיאה
    }

    const items = await ShopItem.find({ _id: { $in: shop.items } });
    res.json(items); // ✅ חייב להחזיר מערך!
  } catch (err) {
    console.error('שגיאה בשליפת פריטים לפי עיר:', err);
    res.status(500).json({ error: 'שגיאה בשליפת הפריטים לעיר' });
  }
});

module.exports = router;
