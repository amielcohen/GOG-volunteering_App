export function calculateRewardCoins(volunteering, cityOrgEntry) {
  if (!cityOrgEntry?.maxRewardPerVolunteering) return 0;

  if (volunteering.rewardType === 'percent') {
    const percent = volunteering.reward || 0;
    return Math.floor((percent / 100) * cityOrgEntry.maxRewardPerVolunteering);
  }

  // בעתיד: rewardType === 'model' → תחזית מבוססת AI
  return 0;
}
