import levelTable from './../constants/levelTable.js';

// פונקציית חישוב רמה ו-EXP בתוך הרמה
export function calculateUserLevelAndExp(totalCumulativeExp) {
  let currentLevel = 1;
  let expAccumulatedThroughLevels = 0;

  for (let i = 1; i <= 20; i++) {
    const requiredExpForThisLevel = levelTable[i]?.requiredExp;

    if (
      requiredExpForThisLevel === null ||
      totalCumulativeExp < expAccumulatedThroughLevels + requiredExpForThisLevel
    ) {
      const expInCurrentLevel =
        totalCumulativeExp - expAccumulatedThroughLevels;
      return { level: i, expInCurrentLevel };
    }

    expAccumulatedThroughLevels += requiredExpForThisLevel;
    currentLevel = i + 1;
  }

  const totalExpNeededToReachLevel20 = Object.values(levelTable)
    .slice(0, 19)
    .reduce((sum, item) => sum + (item.requiredExp || 0), 0);

  const expInMaxLevel = totalCumulativeExp - totalExpNeededToReachLevel20;
  return { level: 20, expInCurrentLevel: expInMaxLevel };
}
