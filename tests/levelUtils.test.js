import { calculateUserLevelAndExp } from '../utils/levelUtils';

describe('calculateUserLevelAndExp', () => {
  test('level 1 for 0 EXP', () => {
    const result = calculateUserLevelAndExp(0);
    expect(result.level).toBe(1);
    expect(result.expInCurrentLevel).toBe(0);
  });

  test('correct level when exactly reaching level 2', () => {
    const result = calculateUserLevelAndExp(20); // requiredExp for level 1 is 20
    expect(result.level).toBe(2);
    expect(result.expInCurrentLevel).toBe(0);
  });

  test('exp is calculated correctly within level', () => {
    const result = calculateUserLevelAndExp(35); // level 2 with 15 EXP in current level
    expect(result.level).toBe(2);
    expect(result.expInCurrentLevel).toBe(15);
  });

  test('level 20 with surplus EXP', () => {
    const result = calculateUserLevelAndExp(2200); // far beyond level 20
    expect(result.level).toBe(20);
    expect(result.expInCurrentLevel).toBeGreaterThan(0);
  });
});
