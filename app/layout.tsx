import type { Metadata } from "next";

import "./globals.css";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";

import Header from "@/components/Header";
import FooterNav from "@/components/FooterNav";
import AchievementToast from "@/components/AchievementToast";

export const metadata: Metadata = {
  title: "習慣化頑張るくん",
  description: "習慣化支援アプリ",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getUserId();

  let user = null;

  if (userId) {
    user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

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
        <AchievementToast />
        <Header name={user?.name ?? "ゲスト"} image={user?.image} />

        <main className="max-w-[900px] mx-auto p-6 pb-40">{children}</main>

        {userId && <FooterNav />}
      </body>
    </html>
  );
}
