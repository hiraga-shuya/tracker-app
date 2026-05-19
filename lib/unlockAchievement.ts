import { prisma } from "@/lib/prisma";

export async function unlockAchievement(
  userId: string,
  achievementKey: string,
) {
  const achievement = await prisma.achievement.findUnique({
    where: {
      key: achievementKey,
    },
  });

  if (!achievement) {
    return [];
  }

  const exists = await prisma.userAchievement.findUnique({
    where: {
      userId_achievementKey: {
        userId,
        achievementKey,
      },
    },
  });

  if (exists) {
    return [];
  }

  await prisma.userAchievement.create({
    data: {
      userId,
      achievementKey,
    },
  });

  // 🔥 ここ超重要：必ず配列で返す
  return [achievement];
}
