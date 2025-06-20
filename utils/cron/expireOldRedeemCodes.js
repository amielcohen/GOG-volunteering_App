// utils/cron/expireOldRedeemCodes.js

import RedeemCode from '../../my-backend/models/RedeemCode.js';

export async function expireOldRedeemCodes(thresholdDate = null) {
  const now = new Date();
  const threshold =
    thresholdDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 ימים אחורה

  console.log(
    `🔄 [${now.toLocaleString()}] בודק קודים שנוצרו לפני: ${threshold.toLocaleString()}`
  );

  try {
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
      return result.modifiedCount;
    } else {
      console.log('✅ אין קודים לפקיעה כרגע');
      return 0;
    }
  } catch (err) {
    console.error('❌ שגיאה בבדיקת קודים שפג תוקפם:', err);
    throw err;
  }
}
