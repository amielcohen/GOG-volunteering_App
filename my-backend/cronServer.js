require('dotenv').config(); // טוען את משתני הסביבה מקובץ .env
const cron = require('node-cron');
const connectDB = require('./db');
const RedeemCode = require('./models/RedeemCode');

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
