const express = require('express');
const router = express.Router();
const Volunteering = require('../models/Volunteering');
const City = require('../models/City');
const CityOrganization = require('../models/CityOrganization');

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

module.exports = router;
