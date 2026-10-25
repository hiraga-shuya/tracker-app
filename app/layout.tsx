import type { Metadata, Viewport } from "next";

import "./globals.css";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";
import { getLevelInfo } from "@/lib/level";

import Header from "@/components/Header";
import FooterNav from "@/components/FooterNav";
import AchievementToast from "@/components/AchievementToast";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "習慣化頑張るくん",
  description: "習慣化支援アプリ",
};

// PWA として開いたときのテーマカラー（マニフェストの theme_color と合わせる）
export const viewport: Viewport = {
  themeColor: "#ffd54f",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getUserId();

  let user = null;
  let unlockedCount = 0;

  if (userId) {
    user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    // レベル表示用に、達成済みの実績の数を数える
    unlockedCount = await prisma.userAchievement.count({
      where: {
        userId,
      },
    });
  }

  const levelInfo = getLevelInfo(unlockedCount);

  return (
    <html lang="ja">
      <head>
        {/* Googleフォント読み込み */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />

        <link
          href="https://fonts.googleapis.com/css2?family=DotGothic16&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ServiceWorkerRegister />
        <AchievementToast />
        <Header
          name={user?.name ?? "ゲスト"}
          image={user?.image}
          level={levelInfo.level}
          levelTitle={levelInfo.title}
        />

        <main className="max-w-[900px] mx-auto p-6 pb-40">{children}</main>

        {userId && <FooterNav />}
      </body>
    </html>
  );
}
