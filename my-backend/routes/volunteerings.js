const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const Volunteering = require('../models/Volunteering');
const City = require('../models/City');
const CityOrganization = require('../models/CityOrganization');
const User = require('../models/Users');
const levelTable = require('../../constants/levelTable');
const { calculateRewardCoins } = require('../../utils/rewardUtils');
const { calculateExpFromMinutes } = require('../../utils/expUtils');

// יצירת התנדבות חדשה
router.post('/create', async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      durationMinutes,
      address,
      coordinates,
      city,
      organizationId,
      createdBy,
      tags,
      rewardType,
      reward,
      isRecurring,
      recurringDay,
      maxParticipants,
      imageUrl,
      notesForVolunteers,
    } = req.body;

    if (
      !title ||
      !date ||
      !durationMinutes ||
      !address ||
      !city ||
      !organizationId ||
      !createdBy
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newVolunteering = new Volunteering({
      title,
      description,
      date: new Date(date),
      durationMinutes,
      address,
      coordinates: coordinates || {},
      city,
      organizationId,
      createdBy,
      tags: tags || [],
      rewardType: rewardType || 'percent',
      reward: reward || 0,
      isRecurring: !!isRecurring,
      recurringDay: isRecurring ? recurringDay : null,
      maxParticipants: maxParticipants || null,
      imageUrl,
      notesForVolunteers,
    });

    await newVolunteering.save();

    res.status(201).json({
      message: 'Volunteering created successfully',
      volunteering: newVolunteering,
    });
  } catch (error) {
    console.error('Error creating volunteering:', error);
    res.status(500).json({ message: 'Error creating volunteering' });
  }
});

// רישום משתמש להתנדבות
router.post('/:id/register', async (req, res) => {
  const volunteeringId = req.params.id;
  const { userId } = req.body;

  console.log('📥 רישום משתמש להתנדבות');
  console.log('volunteeringId:', volunteeringId);
  console.log('userId:', userId);

  try {
    const volunteering = await Volunteering.findById(volunteeringId);
    if (!volunteering) {
      console.warn('❌ לא נמצאה התנדבות');
      return res.status(404).json({ message: 'Volunteering not found' });
    }

    const alreadyRegistered = volunteering.registeredVolunteers.some(
      (entry) => entry.userId.toString() === userId
    );

    if (alreadyRegistered) {
      console.warn('⚠️ המשתמש כבר רשום');
      return res.status(400).json({ message: 'User already registered' });
    }

    volunteering.registeredVolunteers.push({ userId, status: 'approved' });
    await volunteering.save();

    res.json({
      message: 'Successfully registered to volunteering',
      volunteering,
    });
  } catch (error) {
    console.error('🔥 שגיאה אמיתית ברישום:', error);
    res.status(500).json({ message: 'Error registering to volunteering' });
  }
});

router.post('/:volunteeringId/unregister', async (req, res) => {
  const { volunteeringId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  try {
    const updated = await Volunteering.findByIdAndUpdate(
      volunteeringId,
      {
        $pull: { registeredVolunteers: { userId: userId } },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Volunteering not found' });
    }

    res.json({ message: 'Unregistered successfully' });
  } catch (err) {
    console.error('❌ Error unregistering from volunteering:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// שליפת כל ההתנדבויות לעיר לפי מחרוזת
router.get('/', async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ message: 'Missing city' });

  try {
    const results = await Volunteering.find({ city, cancelled: false });
    res.status(200).json(results);
  } catch (err) {
    console.error('Error loading volunteerings:', err);
    res.status(500).json({ message: 'Error loading volunteerings' });
  }
});

// שליפת התנדבויות שרלוונטיות לעיר מסוימת
router.get('/byCity/:cityName', async (req, res) => {
  const { cityName } = req.params;

  try {
    // שלב 1: מציאת מזהה העיר לפי שם
    const city = await City.findOne({ name: cityName });
    if (!city) {
      console.log('City not found:', cityName);
      return res.status(404).json({ message: 'City not found' });
    }

    // שלב 2: מציאת כל עמותות שמקושרות לעיר הזו
    const cityOrgs = await CityOrganization.find({ city: city._id });
    console.log(
      'City organizations found:',
      cityOrgs.map((o) => ({
        name: o.name,
        orgId: o.organizationId?.toString(),
      }))
    );

    // יצירת רשימת מזהי עמותות תקפים בעיר זו
    const orgIds = cityOrgs
      .map((org) => org.organizationId?.toString())
      .filter(Boolean);
    console.log('Organization IDs:', orgIds);

    // שלב 3: מציאת כל ההתנדבויות שמקושרות לאותן עמותות
    const volunteerings = await Volunteering.find({
      organizationId: { $in: orgIds },
      cancelled: { $ne: true },
    });
    console.log(
      'Volunteerings found:',
      volunteerings.map((v) => ({
        title: v.title,
        organizationId: v.organizationId?.toString(),
      }))
    );

    res.status(200).json(volunteerings);
  } catch (err) {
    console.error('Error in /byCity route:', err);
    res.status(500).json({ message: 'Error loading volunteerings for city' });
  }
});

// שליפת התנדבות לפי ID
router.get('/:id', async (req, res) => {
  try {
    const volunteering = await Volunteering.findById(req.params.id);
    if (!volunteering) {
      return res.status(404).json({ message: 'Volunteering not found' });
    }
    res.json(volunteering);
  } catch (error) {
    console.error('Error fetching volunteering by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// שליפה לפי משתמש שנרשם להתנדבות
router.get('/forUser/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const volunteerings = await Volunteering.find({
      'registeredVolunteers.userId': userId,
    }).sort({ date: 1 }); // מיון לפי תאריך עולה (אופציונלי)

    res.json(volunteerings);
  } catch (err) {
    console.error('❌ Error fetching user volunteerings:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// שליפת התנדבויות פתוחות עתידיות שנוצרו ע"י אחראים מהעיר שלך
router.get('/future/open/byCityOfRep/:repId', async (req, res) => {
  const { repId } = req.params;

  try {
    const now = new Date();

    // 1. שליפת פרטי האחראי הנוכחי
    const rep = await User.findById(repId);
    if (!rep || rep.role !== 'OrganizationRep') {
      return res.status(404).json({ message: 'OrganizationRep not found' });
    }

    // 2. שליפת כל היוזרים מאותה עיר (OrganizationReps)
    const repsInCity = await User.find({
      city: rep.city,
      role: 'OrganizationRep',
    });
    const repIds = repsInCity.map((r) => r._id);

    // 3. שליפת התנדבויות עתידיות ש־createdBy שלהן הוא אחד מאנשי העיר
    const volunteerings = await Volunteering.find({
      createdBy: { $in: repIds },
      cancelled: { $ne: true },
      isClosed: { $ne: true },
      date: { $gt: now },
    }).sort({ date: 1 });

    res.status(200).json(volunteerings);
  } catch (err) {
    console.error('❌ Error fetching volunteerings by city:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ביטול התנדבות
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Volunteering.findByIdAndUpdate(
      id,
      { cancelled: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Volunteering not found' });
    }

    res.status(200).json({
      message: 'Volunteering cancelled successfully',
      volunteering: updated,
    });
  } catch (err) {
    console.error('Error cancelling volunteering:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// שליפת התנדבויות שעברו/מתקיימות עכשיו – ועדיין פתוחות – לפי עיר של אחראי
router.get('/attendance/:repId', async (req, res) => {
  const { repId } = req.params;

  try {
    const now = new Date();

    // שלב 1 – שליפת אחראי ובדיקת הרשאה
    const rep = await User.findById(repId);
    if (!rep || rep.role !== 'OrganizationRep') {
      return res.status(404).json({ message: 'OrganizationRep not found' });
    }

    // שלב 2 – שליפת כל אחראי העמותות באותה עיר
    const repsInCity = await User.find({
      city: rep.city,
      role: 'OrganizationRep',
    });
    const repIds = repsInCity.map((r) => r._id);

    // שלב 3 – שליפת התנדבויות עם תאריך עבר/עכשיו, ועדיין לא סגורות
    const volunteerings = await Volunteering.find({
      createdBy: { $in: repIds },
      cancelled: { $ne: true },
      isClosed: { $ne: true },
      date: { $lte: now },
    })
      .sort({ date: -1 })
      .populate('registeredVolunteers.userId');

    res.status(200).json(volunteerings);
  } catch (err) {
    console.error('❌ Error fetching attendance volunteerings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// עדכון שדה attended לפי userId מתוך מפת נוכחות
router.put('/:id/attendance', async (req, res) => {
  const { id } = req.params;
  const { attended } = req.body; // מפת {userId: true/false}

  try {
    const volunteering = await Volunteering.findById(id);
    if (!volunteering) {
      return res.status(404).json({ message: 'Volunteering not found' });
    }

    volunteering.registeredVolunteers = volunteering.registeredVolunteers.map(
      (v) => {
        if (attended.hasOwnProperty(v.userId.toString())) {
          return {
            ...v.toObject(),
            attended: attended[v.userId.toString()],
          };
        }
        return v;
      }
    );

    await volunteering.save();
    res.status(200).json({ message: 'Attendance updated' });
  } catch (err) {
    console.error('❌ Error updating attendance:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/close', async (req, res) => {
  const { id } = req.params;

  try {
    const volunteering = await Volunteering.findById(id).populate(
      'registeredVolunteers.userId'
    );
    if (!volunteering) {
      return res.status(404).json({ message: 'Volunteering not found' });
    }

    volunteering.isClosed = true;
    await volunteering.save();

    const duration = volunteering.durationMinutes || 0;
    const addedExp = calculateExpFromMinutes(duration); // ה-EXP שנוסף מההתנדבות

    for (const v of volunteering.registeredVolunteers) {
      if (v.attended && v.status === 'approved') {
        const user = await User.findById(v.userId._id || v.userId);
        if (!user) continue;

        // מציאת עמותה עירונית מתאימה
        const cityOrgEntry = await CityOrganization.findOne({
          city: user.city,
          organizationId: volunteering.organizationId,
        });

        const GoGs = calculateRewardCoins(volunteering, cityOrgEntry);

        // הוספת גוגואים
        user.GoGs += GoGs;
        // הוספת ה-EXP שנצבר ל-EXP הקיים של המשתמש ברמה הנוכחית
        user.exp += addedExp;

        // *** כאן התיקון המדויק ללוגיקת עליית הרמה ***
        // לולאה שמטפלת בעליית רמות מרובות אם נצבר מספיק EXP
        while (true) {
          // *** קבל את ה-requiredExp לרמה הנוכחית של המשתמש ***
          const requiredExpForCurrentLevel =
            levelTable[user.level]?.requiredExp;

          // תנאי יציאה:
          // 1. אם הגענו לרמה המקסימלית (requiredExp הוא null)
          // 2. אם אין נתונים לרמה הנוכחית בטבלה (מקרה חריג)
          // 3. אם ה-EXP של המשתמש קטן מהנדרש לעלות רמה
          if (
            requiredExpForCurrentLevel === null ||
            requiredExpForCurrentLevel === undefined ||
            user.exp < requiredExpForCurrentLevel
          ) {
            break; // יוצא מהלולאה, המשתמש לא יכול לעלות רמה נוספת כרגע
          }

          // אם יש מספיק EXP לעלות רמה:
          user.exp -= requiredExpForCurrentLevel; // הפחת את ה-EXP שנדרש כדי לעלות רמה
          user.level++; // העלה את רמת המשתמש
          // הלולאה תמשיך לאיטרציה הבאה, ותבדוק את הרמה החדשה עם ה-EXP הנותר
        }

        await user.save();

        console.log(
          `✅ ${user.username} קיבל ${GoGs} גוגואים ו-${addedExp} EXP. רמה חדשה: ${user.level}, EXP בתוך הרמה: ${user.exp}`
        );
      }
    }

    res.status(200).json({ message: 'Volunteering closed' });
  } catch (err) {
    console.error('❌ Error closing volunteering:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
