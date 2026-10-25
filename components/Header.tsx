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
      <div className="mx-auto flex max-w-[900px] flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:py-3">
        {/* タイトル（スマホでは1段目に置き、文字が縦に折り返されないようにする） */}
        <Link
          href="/"
          className="self-start border-4 border-black bg-[#fff8dc] px-4 py-1.5 text-sm shadow-[4px_4px_0_0_#000] sm:py-2"
        >
          <div className="whitespace-nowrap text-[10px] opacity-70">
            HABIT TRACKING GAME
          </div>

          <div className="whitespace-nowrap text-base font-bold tracking-wider sm:text-lg">
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
