require('dotenv').config(); // טוען את משתני הסביבה מקובץ .env
const cron = require('node-cron');
const connectDB = require('./db');
const RedeemCode = require('./models/RedeemCode');
const Volunteering = require('./models/Volunteering');
const UserMessage = require('./models/UserMessage');
const MonthlyPrize = require('./models/MonthlyPrize');
const MonthlyStats = require('./models/MonthlyStats');

const OrganizationMonthlyStats = require('./models/OrganizationMonthlyStats');
const CityOrganization = require('./models/CityOrganization');
const { calculateRewardCoins } = require('../utils/rewardUtils');
const User = require('./models/Users');

// התחברות למסד הנתונים
connectDB();

// משימה שתופעל כל לילה ב־03:00
cron.schedule('0 3 * * *', async () => {
  const now = new Date();
  const threshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 ימים אחורה

  console.log(
    `🔄 [${now.toLocaleString()}] בודק קודים שנוצרו לפני: ${threshold.toLocaleString()}`
  );

  try {
    // חיפוש קודים ישנים שלא מומשו
    const toExpire = await RedeemCode.find({
      createdAt: { $lt: threshold },
      status: 'pending',
    });

    console.log(`🔍 נמצאו ${toExpire.length} קודים מועמדים לפקיעה`);

    if (toExpire.length > 0) {
      const result = await RedeemCode.updateMany(
        { createdAt: { $lt: threshold }, status: 'pending' },
        { $set: { status: 'expired' } }
      );

      console.log(`🟡 ${result.modifiedCount} קודים סומנו כפגי תוקף`);
    } else {
      console.log('✅ אין קודים לפקיעה כרגע');
    }
  } catch (err) {
    console.error('❌ שגיאה בבדיקת קודים שפג תוקפם:', err);
  }
});

//ייצירת התנדבויות קבועות
cron.schedule('0 3 * * *', async () => {
  console.log('⏰ קרון רץ בשעה 03:00');

  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + 7);
  const targetDay = targetDate.getDay(); // 0-6 (יום בשבוע)

  console.log(
    `🔁 [${now.toLocaleString()}] מחפש התנדבויות קבועות שצריכות להיפתח ליום ${targetDate.toDateString()}`
  );

  try {
    const recurringVols = await Volunteering.find({
      isRecurring: true,
      recurringDay: targetDay,
    });

    let createdCount = 0;

    for (const vol of recurringVols) {
      const originalDate = new Date(vol.date);
      const nextDate = new Date(targetDate);
      nextDate.setHours(
        originalDate.getHours(),
        originalDate.getMinutes(),
        0,
        0
      );

      const existing = await Volunteering.findOne({
        isRecurring: true,
        recurringDay: targetDay,
        title: vol.title,
        address: vol.address,
        date: {
          $gte: new Date(nextDate.getTime() - 1000 * 60 * 60), // שעת חסם נמוכה
          $lte: new Date(nextDate.getTime() + 1000 * 60 * 60), // שעת חסם גבוהה
        },
      });

      if (existing) {
        console.log(
          `⚠️ כבר קיימת התנדבות דומה ליום ${nextDate.toDateString()}`
        );
        continue;
      }

      const newVol = new Volunteering({
        ...vol.toObject(),
        _id: undefined,
        date: nextDate,
        registeredVolunteers: [],
        isClosed: false,
        cancelled: false,
        createdAt: new Date(),
        isRecurring: false,
        recurringDay: null,
      });

      await newVol.save();
      createdCount++;
    }

    console.log(`✅ נוצרו ${createdCount} התנדבויות חדשות לשבוע הבא`);
  } catch (err) {
    console.error('❌ שגיאה ביצירת התנדבויות קבועות:', err);
  }
});

cron.schedule('0 3 1 * *', async () => {
  const now = new Date();
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const month = now.getMonth() === 0 ? 11 : now.getMonth() - 1; // החודש הקודם

  console.log(`🏆 [REWARDS] מתחיל חלוקת פרסים לחודש ${month + 1}/${year}`);

  try {
    const types = ['minutes', 'count'];

    for (const type of types) {
      const prizeSets = await MonthlyPrize.find({ year, month, type });

      for (const prizeDoc of prizeSets) {
        console.log(
          `📊 עיר: ${prizeDoc.city}, סוג: ${type}, פרסים: ${prizeDoc.prizes.length}`
        );

        const sortField =
          type === 'minutes' ? 'totalMinutes' : 'totalVolunteeringCount';

        const leaderboard = await MonthlyStats.find({
          city: prizeDoc.city,
          year,
          month,
        })
          .sort({ [sortField]: -1 })
          .limit(10)
          .populate('userId');

        for (const reward of prizeDoc.prizes) {
          const userStat = leaderboard[reward.place - 1];
          if (!userStat || !userStat.userId) {
            console.log(`⚠️ אין משתמש למקום ${reward.place}`);
            continue;
          }

          const user = userStat.userId;

          if (reward.type === 'gog') {
            user.GoGs += reward.value;
            try {
              await user.save();
              console.log(
                `💰 מוסיף ${reward.value} גוגואים למשתמש ${user.firstName} (${user.username})`
              );
            } catch (saveErr) {
              console.error('❌ שגיאה בשמירת גוגואים:', saveErr.message);
            }
          }

          try {
            await new UserMessage({
              userId: user._id,
              title: '🏅 זכית בפרס חודשי!',
              message: `דורגת מקום ${reward.place} לפי ${
                type === 'minutes' ? 'משך זמן ההתנדבות' : 'כמות התנדבויות'
              } וזכית ב-${reward.type === 'gog' ? `${reward.value} גוגואים` : 'פרס מיוחד'}!`,
              type: 'success',
              source: 'לוח מובילים חודשי',
            }).save();

            console.log(
              `📩 נשלחה הודעה ל-${user.username} על פרס מקום ${reward.place}`
            );
          } catch (msgErr) {
            console.warn(
              `⚠️ שגיאה בשליחת הודעה למשתמש ${user.username}:`,
              msgErr.message
            );
          }
        }
      }
    }

    console.log('✅ [REWARDS] סיום חלוקת פרסים');
  } catch (err) {
    console.error('❌ [REWARDS] שגיאה בחלוקת פרסים:', err);
  }
});

cron.schedule('0 3 1 * *', async () => {
  const now = new Date();
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const month = now.getMonth() === 0 ? 12 : now.getMonth();

  console.log(
    `📊 [ORGANIZATION_STATS] יוצרים סיכומים עבור חודש ${month}/${year} (${now.toLocaleString()})`
  );

  try {
    const cityOrganizations = await CityOrganization.find({});
    console.log(`🔍 נמצאו ${cityOrganizations.length} עמותות עירוניות`);

    let totalProcessed = 0;

    for (const cityOrg of cityOrganizations) {
      const { organizationId, city } = cityOrg;
      console.log(`🏷️ עמותה: ${organizationId}, עיר: ${city}`);

      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);

      const volunteerings = await Volunteering.find({
        organizationId,
        isClosed: true,
        date: { $gte: startOfMonth, $lte: endOfMonth },
      });

      console.log(
        `📆 נמצאו ${volunteerings.length} התנדבויות סגורות לעמותה הזו`
      );

      let totalCoins = 0;
      let totalMinutes = 0;
      let totalVolunteers = 0;
      let uniqueVolunteersSet = new Set();
      let timestamps = [];
      let relevantVolunteerings = 0;

      for (const vol of volunteerings) {
        const reward = calculateRewardCoins(vol, cityOrg);
        let hasVolunteerFromCity = false;

        for (const reg of vol.registeredVolunteers || []) {
          if (reg.attended) {
            const user = await User.findById(reg.userId);
            if (user?.city?.toString() === city.toString()) {
              totalCoins += reward;
              totalMinutes += vol.durationMinutes;
              totalVolunteers++;
              uniqueVolunteersSet.add(String(reg.userId));
              timestamps.push(vol.date);
              hasVolunteerFromCity = true;
            }
          }
        }

        if (hasVolunteerFromCity) relevantVolunteerings++;
      }

      const statsDoc = {
        organizationId,
        city,
        month,
        year,
        totalCoins,
        totalVolunteerings: volunteerings.length,
        relevantVolunteerings,
        totalVolunteers,
        uniqueVolunteers: uniqueVolunteersSet.size,
        totalMinutes,
        volunteeringTimestamps: timestamps,
      };

      await OrganizationMonthlyStats.findOneAndUpdate(
        { organizationId, city, month, year },
        statsDoc,
        { upsert: true, new: true }
      );

      console.log(
        `✅ סטטיסטיקות נשמרו לעמותה ${organizationId} בעיר ${city} (${volunteerings.length} התנדבויות)`
      );

      totalProcessed++;
    }

    console.log(`🎯 סיום עיבוד: ${totalProcessed} עמותות עודכנו`);
  } catch (err) {
    console.error('❌ שגיאה בהרצת סטטיסטיקת עמותות:', err);
  }
});
