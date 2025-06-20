const { calculateExpFromMinutes } = require('../utils/expUtils');

describe('EXP Calculation', () => {
  test('returns 10 EXP for 60 minutes', () => {
    expect(calculateExpFromMinutes(60)).toBe(10);
  });

  test('returns 0 for 0 minutes', () => {
    expect(calculateExpFromMinutes(0)).toBe(0);
  });

  test('returns 5 EXP for 30 minutes', () => {
    expect(calculateExpFromMinutes(30)).toBe(5);
  });

  test('rounds down fractional EXP correctly', () => {
    expect(calculateExpFromMinutes(89)).toBe(14); // 14.83...
  });

  test('returns negative EXP for negative minutes', () => {
    expect(calculateExpFromMinutes(-60)).toBe(-10);
  });
});
