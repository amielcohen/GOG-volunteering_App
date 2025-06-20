// utils/closeVolunteeringHandlers.js

import levelTable from './../constants/levelTable.js';
import { calculateRewardCoins } from './rewardUtils.js';
import { calculateExpFromMinutes } from './expUtils.js';
import { calculateUserLevelAndExp } from './levelUtils.js';
import MonthlyStats from '../my-backend/models/MonthlyStats.js';
import UserMessage from '../my-backend/models/UserMessage.js';

export async function handleApprovedVolunteer({
  user,
  volunteering,
  cityOrgEntry,
  organizationName,
}) {
  const duration = volunteering.durationMinutes || 0;
  const addedExp = calculateExpFromMinutes(duration);
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

  const month = volunteering.date.getMonth();
  const year = volunteering.date.getFullYear();

  await MonthlyStats.findOneAndUpdate(
    { userId: user._id, month, year },
    {
      $inc: {
        totalMinutes: duration,
        totalVolunteeringCount: 1,
      },
      $setOnInsert: {
        city: user.city,
      },
    },
    { upsert: true }
  );

  await new UserMessage({
    userId: user._id,
    title: `התנדבות "${volunteering.title}" הושלמה!`,
    message: `כל הכבוד על ההשתתפות! צברת ${GoGs} גוגאוים ו-${addedExp} נק״ן.`,
    type: 'success',
    source: organizationName,
  }).save();

  return { newLevel, GoGs };
}

export async function handleMissedVolunteer({
  user,
  volunteering,
  organizationName,
}) {
  const now = new Date();
  const THRESHOLD_DAYS = 180;
  const MAX_BAD_POINTS = 3;
  const BLOCK_DAYS = 14;

  // 1. ניקוי נקודות ישנות
  user.badPoints = user.badPoints.filter(
    (pointDate) =>
      now - new Date(pointDate) <= THRESHOLD_DAYS * 24 * 60 * 60 * 1000
  );

  // 2. הוספת נקודה חדשה
  user.badPoints.push(now);

  // 3. בדיקת חסימה
  if (user.badPoints.length >= MAX_BAD_POINTS) {
    user.blockedUntil = new Date(
      now.getTime() + BLOCK_DAYS * 24 * 60 * 60 * 1000
    );
  }

  // 4. שמירה
  await user.save();

  // 5. הודעה למשתמש
  await new UserMessage({
    userId: user._id,
    title: `לא נכחת בהתנדבות "${volunteering.title}"`,
    message: `לא הגעת להתנדבות. לא נצברו נקודות.
יש לך כעת ${user.badPoints.length} נקודות רעות מתוך ${MAX_BAD_POINTS} המותרות.
צבירה של ${MAX_BAD_POINTS} נקודות רעות תוך ${THRESHOLD_DAYS} ימים תגרום לחסימה זמנית מהרשמה להתנדבויות חדשות.`,
    type: 'warning',
    source: organizationName,
  }).save();

  return {
    badPoints: user.badPoints.length,
    blockedUntil: user.blockedUntil || null,
  };
}
