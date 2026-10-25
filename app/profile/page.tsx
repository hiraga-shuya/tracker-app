import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";

import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const userId = await getUserId();

  if (!userId) {
    return <div>ユーザー情報がありません</div>;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  // 達成済みの実績一覧をサーバー側で取得する。
  // ページの再描画（保存後の router.refresh 等）で自動で最新になるよう、
  // クライアント側で取り直すのではなく、ここから props で渡す。
  const userAchievements = await prisma.userAchievement.findMany({
    where: {
      userId,
    },
    orderBy: {
      unlockedAt: "desc", // 新しく達成したものから順に表示する
    },
  });

  const masters = await prisma.achievement.findMany({
    where: {
      key: {
        in: userAchievements.map((a) => a.achievementKey),
      },
    },
  });

  const masterByKey = new Map(masters.map((m) => [m.key, m]));

  const achievements = userAchievements.flatMap((ua) => {
    const master = masterByKey.get(ua.achievementKey);

    return master
      ? [{ id: master.id, key: master.key, title: master.title }]
      : [];
  });

  return (
    <ProfileForm
      initialName={user?.name ?? ""}
      initialImage={user?.image}
      initialAchievements={achievements}
      recoveryCode={userId}
    />
  );
}
