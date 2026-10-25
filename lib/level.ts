import { levelTitles } from "@/src/constants/levelTitles";

// レベルは「達成した実績の数」そのもの。初期レベルは0で、
// 実績を1つ達成するごとに1上がる（例：「初めてアプリを起動した」で Lv.1）
export function getLevel(unlockedCount: number) {
  return unlockedCount;
}

// レベル帯に応じた称号を返す（src/constants/levelTitles.ts のリストから、
// そのレベル以下で一番大きい minLevel の称号を選ぶ）
export function getLevelTitle(level: number) {
  let title: string = levelTitles[0].title;

  for (const entry of levelTitles) {
    if (level >= entry.minLevel) {
      title = entry.title;
    }
  }

  return title;
}

// ヘッダー表示用に、達成数からレベルと称号をまとめて返す
export function getLevelInfo(unlockedCount: number) {
  const level = getLevel(unlockedCount);

  return {
    level,
    title: getLevelTitle(level),
  };
}
