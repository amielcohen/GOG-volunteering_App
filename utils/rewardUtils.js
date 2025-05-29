export function calculateRewardCoins(volunteering, cityOrgEntry) {
  if (!cityOrgEntry?.maxRewardPerVolunteering) return 0;

  const percent = volunteering.reward || 0;
  return Math.floor((percent / 100) * cityOrgEntry.maxRewardPerVolunteering);
}
