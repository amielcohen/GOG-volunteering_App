const MonthlyPrize = require('../../my-backend/models/MonthlyPrize');
const MonthlyStats = require('../../my-backend/models/MonthlyStats');
const User = require('../../my-backend/models/Users');
const UserMessage = require('../../my-backend/models/UserMessage');

async function distributeMonthlyPrizes(date = new Date()) {
  const year =
    date.getMonth() === 0 ? date.getFullYear() - 1 : date.getFullYear();
  const month = date.getMonth() === 0 ? 11 : date.getMonth() - 1;

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
    throw err;
  }
}

module.exports = distributeMonthlyPrizes;
