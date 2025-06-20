const { calculateRewardCoins } = require('../utils/rewardUtils');

describe('Reward Calculation', () => {
  const cityOrgEntry = { maxRewardPerVolunteering: 100 };

  test('calculates correct reward amount for 50%', () => {
    const volunteering = { reward: 50 };
    const result = calculateRewardCoins(volunteering, cityOrgEntry);
    expect(result).toBe(50);
  });

  test('calculates correct reward amount for 0%', () => {
    const volunteering = { reward: 0 };
    const result = calculateRewardCoins(volunteering, cityOrgEntry);
    expect(result).toBe(0);
  });

  test('returns 0 if no reward field in volunteering', () => {
    const volunteering = {};
    const result = calculateRewardCoins(volunteering, cityOrgEntry);
    expect(result).toBe(0);
  });

  test('returns 0 if cityOrgEntry is missing', () => {
    const volunteering = { reward: 50 };
    const result = calculateRewardCoins(volunteering, null);
    expect(result).toBe(0);
  });

  test('returns 0 if maxRewardPerVolunteering is missing', () => {
    const volunteering = { reward: 50 };
    const cityOrgEntry = {}; // missing maxRewardPerVolunteering
    const result = calculateRewardCoins(volunteering, cityOrgEntry);
    expect(result).toBe(0);
  });
});
