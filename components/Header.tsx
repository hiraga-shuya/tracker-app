import Link from "next/link";

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

        {/* 右側UI */}
        <div className="flex items-center gap-3">
          {/* ステータス（レベルと称号は達成した実績の数から算出） */}
          <div className="border-4 border-black bg-[#fff8dc] px-2 py-2 shadow-[4px_4px_0_0_#000] md:px-3">
            <div className="text-[10px]">STATUS</div>

            <div className="mt-1 whitespace-nowrap text-xs md:text-sm">
              Lv.{level} {levelTitle}
            </div>
          </div>

          {/* プロフィール */}
          <Link
            href="/profile"
            className="flex items-center gap-3 border-4 border-black bg-[#fff8dc] px-3 py-2 shadow-[4px_4px_0_0_#000] transition-all hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#000] active:translate-y-[3px] active:shadow-none"
          >
            {/* アイコン */}
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-black bg-[#ddd]">
              {image ? (
                <img
                  src={image || "/images/default-avatar.png"}
                  alt="プロフィール画像"
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>

            {/* 名前 */}
            <div>
              <div className="text-[10px] opacity-70">PLAYER</div>

              <div className="max-w-[120px] truncate text-sm font-bold">
                {name}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
