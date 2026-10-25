import Link from "next/link";

import HeaderStatus from "@/components/HeaderStatus";

type Props = {
  name: string;
  image?: string | null;
  level: number;
  levelTitle: string;
};

export default function Header({ name, image, level, levelTitle }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b-4 border-black bg-[#d6c29a] shadow-[0_4px_0_0_#000]">
      <div className="mx-auto flex max-w-[900px] items-center justify-between px-4 py-3">
        {/* タイトル */}
        <Link
          href="/"
          className="border-4 border-black bg-[#fff8dc] px-4 py-2 text-sm shadow-[4px_4px_0_0_#000]"
        >
          <div className="text-[10px] opacity-70">HABIT TRACKING GAME</div>

          <div className="text-lg font-bold tracking-wider">
            習慣化頑張るくん
          </div>
        </Link>

        {/* 右側UI（ステータスとプロフィール。値は HeaderStatus が最新化する） */}
        <HeaderStatus
          initialName={name}
          initialImage={image}
          initialLevel={level}
          initialTitle={levelTitle}
        />
      </div>
    </header>
  );
}
