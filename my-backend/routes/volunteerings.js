const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const Volunteering = require('../models/Volunteering');
const City = require('../models/City');
const CityOrganization = require('../models/CityOrganization');
const User = require('../models/Users');
const UserMessage = require('../models/UserMessage');
const Organization = require('../models/Organization');

const levelTable = require('../../constants/levelTable').default;
const { calculateRewardCoins } = require('../../utils/rewardUtils');
const { calculateExpFromMinutes } = require('../../utils/expUtils');

// פונקציית חישוב רמה ו-EXP בתוך הרמה
function calculateUserLevelAndExp(totalCumulativeExp) {
  let currentLevel = 1;
  let expAccumulatedThroughLevels = 0;

  for (let i = 1; i <= 20; i++) {
    const requiredExpForThisLevel = levelTable[i]?.requiredExp;
    if (
      requiredExpForThisLevel === null ||
      totalCumulativeExp < expAccumulatedThroughLevels + requiredExpForThisLevel
    ) {
      const expInCurrentLevel =
        totalCumulativeExp - expAccumulatedThroughLevels;
      return { level: i, expInCurrentLevel: expInCurrentLevel };
    }
    expAccumulatedThroughLevels += requiredExpForThisLevel;
    currentLevel = i + 1;
  }

  const totalExpNeededToReachLevel20 = Object.values(levelTable)
    .slice(0, 19)
    .reduce((sum, item) => sum + (item.requiredExp || 0), 0);
  const expInMaxLevel = totalCumulativeExp - totalExpNeededToReachLevel20;
  return { level: 20, expInCurrentLevel: expInMaxLevel };
}

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
      minlevel: req.body.minlevel ?? 0,
    });

    await newVolunteering.save();
    res.status(201).json({
      message: 'Volunteering created successfully',
      volunteering: newVolunteering,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating volunteering' });
  }
});
// רישום משתמש להתנדבות
router.post('/:id/register', async (req, res) => {
  const volunteeringId = req.params.id;
  const { userId } = req.body;

  try {
    const volunteering = await Volunteering.findById(volunteeringId);
    if (!volunteering) {
      return res.status(404).json({ message: 'Volunteering not found' });
    }

    const alreadyRegistered = volunteering.registeredVolunteers.some(
      (entry) => entry.userId.toString() === userId
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'User already registered' });
    }

    // בדיקה האם הגיעו למקסימום משתתפים
    if (
      volunteering.maxParticipants &&
      volunteering.registeredVolunteers.length >= volunteering.maxParticipants
    ) {
      return res.status(400).json({ message: 'אין מקומות פנויים' });
    }

    // הוספת המתנדב לרשימה
    volunteering.registeredVolunteers.push({
      userId,
      status: 'approved',
      attended: false,
    });

    await volunteering.save();

    res.json({
      message: 'Successfully registered to volunteering',
      volunteering,
    });
  } catch (error) {
    console.error('Error in registration:', error.message);
    res.status(500).json({ message: 'Error registering to volunteering' });
  }
});

// ביטול רישום מהתנדבות
router.post('/:volunteeringId/unregister', async (req, res) => {
  const { volunteeringId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  try {
    const updated = await Volunteering.findByIdAndUpdate(
      volunteeringId,
      { $pull: { registeredVolunteers: { userId: userId } } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Volunteering not found' });
    }

    res.json({ message: 'Unregistered successfully' });
  } catch (err) {
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
    res.status(500).json({ message: 'Error loading volunteerings' });
  }
});

// שליפת התנדבויות שרלוונטיות לעיר מסוימת
router.get('/byCity/:cityName', async (req, res) => {
  const { cityName } = req.params;

  try {
    const city = await City.findOne({ name: cityName });
    if (!city) return res.status(404).json({ message: 'City not found' });

    const cityOrgs = await CityOrganization.find({ city: city._id });
    const orgIds = cityOrgs
      .map((org) => org.organizationId?.toString())
      .filter(Boolean);

    const volunteerings = await Volunteering.find({
      organizationId: { $in: orgIds },
      cancelled: { $ne: true },
    });

    res.status(200).json(volunteerings);
  } catch (err) {
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
    res.status(500).json({ message: 'Server error' });
  }
});

// שליפה לפי משתמש שנרשם להתנדבות
router.get('/forUser/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const volunteerings = await Volunteering.find({
      'registeredVolunteers.userId': userId,
    }).sort({ date: 1 });

    res.json(volunteerings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// שליפת התנדבויות פתוחות עתידיות שנוצרו ע״י אחראים מהעיר שלך
router.get('/future/open/byCityOfRep/:repId', async (req, res) => {
  const { repId } = req.params;

  try {
    const now = new Date();
    const rep = await User.findById(repId);
    if (!rep || rep.role !== 'OrganizationRep') {
      return res.status(404).json({ message: 'OrganizationRep not found' });
    }

    const repsInCity = await User.find({
      city: rep.city,
      role: 'OrganizationRep',
    });
    const repIds = repsInCity.map((r) => r._id);

    const volunteerings = await Volunteering.find({
      createdBy: { $in: repIds },
      cancelled: { $ne: true },
      isClosed: { $ne: true },
      date: { $gt: now },
    }).sort({ date: 1 });

    res.status(200).json(volunteerings);
  } catch (err) {
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
    res.status(500).json({ message: 'Server error' });
  }
});

// שליפת התנדבויות שעברו/מתקיימות עכשיו – ועדיין פתוחות – לפי עיר של אחראי
router.get('/attendance/:repId', async (req, res) => {
  const { repId } = req.params;

  try {
    const now = new Date();
    const rep = await User.findById(repId);
    if (!rep || rep.role !== 'OrganizationRep') {
      return res.status(404).json({ message: 'OrganizationRep not found' });
    }

    const repsInCity = await User.find({
      city: rep.city,
      role: 'OrganizationRep',
    });
    const repIds = repsInCity.map((r) => r._id);

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
    res.status(500).json({ message: 'Server error' });
  }
});

// עדכון שדה attended לפי userId מתוך מפת נוכחות
router.put('/:id/attendance', async (req, res) => {
  const { id } = req.params;
  const { attended } = req.body;

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
    res.status(500).json({ message: 'Server error' });
  }
});

// סגירת התנדבות וחישוב תגמולים
router.put('/:id/close', async (req, res) => {
  const { id } = req.params;

  try {
    const volunteering = await Volunteering.findById(id).populate(
      'registeredVolunteers.userId'
    );
    if (!volunteering) {
      return res.status(404).json({ message: 'Volunteering not found' });
    }

    // שליפת שם העמותה בצורה בטוחה
    let organizationName = 'עמותה לא ידועה';
    try {
      const organization = await Organization.findById(
        volunteering.organizationId
      );
      if (organization?.name) {
        organizationName = organization.name;
      }
    } catch (orgErr) {
      console.warn('[CLOSE_ROUTE] שגיאה בשליפת עמותה:', orgErr.message);
    }

    volunteering.isClosed = true;
    await volunteering.save();

    const duration = volunteering.durationMinutes || 0;
    const addedExp = calculateExpFromMinutes(duration);

    for (const v of volunteering.registeredVolunteers) {
      const user = await User.findById(v.userId._id || v.userId);
      if (!user) continue;

      if (v.attended && v.status === 'approved') {
        const cityOrgEntry = await CityOrganization.findOne({
          city: user.city,
          organizationId: volunteering.organizationId,
        });

        const GoGs = calculateRewardCoins(volunteering, cityOrgEntry);
        user.GoGs += GoGs;

        let totalCumulativeExp = user.exp;
        for (let i = 1; i < user.level; i++) {
          totalCumulativeExp += levelTable[i]?.requiredExp || 0;
        }
        totalCumulativeExp += addedExp;

        const { level: newLevel, expInCurrentLevel: newExpInLevel } =
          calculateUserLevelAndExp(totalCumulativeExp);
        const oldLevel = user.level;

        user.level = newLevel;
        user.exp = newExpInLevel;
        if (newLevel > oldLevel) {
          user.showLevelUpModal = true;
        }
        await user.save();

        // הודעה על הצלחה
        await new UserMessage({
          userId: user._id,
          title: `התנדבות "${volunteering.title}" הושלמה!`,
          message: `כל הכבוד על ההשתתפות! צברת ${GoGs} גוגואים ו-${addedExp} נק״נ.`,
          type: 'success',
          source: organizationName,
        }).save();

        console.log(
          `[CLOSE_ROUTE] ✅ ${user.username} קיבל ${GoGs} גוגואים ו-${addedExp} EXP. רמה חדשה: ${user.level}`
        );
      } else {
        // הודעה על אי־השתתפות
        await new UserMessage({
          userId: user._id,
          title: `לא נכחת בהתנדבות "${volunteering.title}"`,
          message: `לא הגעת להתנדבות. לא נצברו נקודות.`,
          type: 'warning',
          source: organizationName,
        }).save();

        console.log(
          `[CLOSE_ROUTE] ⚠️ ${user.username} לא נכח בהתנדבות - נשלחה אזהרה`
        );
      }
    }

    res.status(200).json({ message: 'Volunteering closed successfully' });
  } catch (err) {
    console.error('[CLOSE_ROUTE] שגיאה:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// שליפת התנדבויות סגורות מהעבר לפי עיר של אחראי עמותה
router.get('/history/byCityOfRep/:repId', async (req, res) => {
  const { repId } = req.params;

  try {
    const now = new Date();
    const rep = await User.findById(repId);
    if (!rep || rep.role !== 'OrganizationRep') {
      return res.status(404).json({ message: 'OrganizationRep not found' });
    }

    const repsInCity = await User.find({
      city: rep.city,
      role: 'OrganizationRep',
    });
    const repIds = repsInCity.map((r) => r._id);

    const volunteerings = await Volunteering.find({
      createdBy: { $in: repIds },
      cancelled: { $ne: true },
      isClosed: true,
      date: { $lt: now },
    })
      .sort({ date: -1 })
      .populate('registeredVolunteers.userId');

    res.status(200).json(volunteerings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
