"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { USER_STATUS_CHANGED_EVENT } from "@/lib/toast";

type Status = {
  name: string;
  image: string | null;
  level: number;
  title: string;
};

type Props = {
  // 初期表示用（サーバー側のレイアウトで取得した値）
  initialName: string;
  initialImage?: string | null;
  initialLevel: number;
  initialTitle: string;
};

// ヘッダー右側のステータス表示（レベル・称号・名前・画像）。
// レイアウトは画面遷移では再描画されないため、古い値が残り続けてしまう。
// そこでこの部品が、画面遷移・アプリへの復帰・実績解除のタイミングで
// /api/user/status から最新の値を取り直して表示を更新する。
export default function HeaderStatus({
  initialName,
  initialImage,
  initialLevel,
  initialTitle,
}: Props) {
  const pathname = usePathname();

  const [status, setStatus] = useState<Status>({
    name: initialName,
    image: initialImage ?? null,
    level: initialLevel,
    title: initialTitle,
  });

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/user/status");

      if (!res.ok) return;

      const data = await res.json();

      setStatus({
        name: data.name,
        image: data.image,
        level: data.level,
        title: data.title,
      });
    } catch {
      // 取得に失敗したときは、今の表示のままにする
    }
  }, []);

  // 画面遷移のたびに最新化する
  useEffect(() => {
    refetch();
  }, [pathname, refetch]);

  // アプリに戻ってきたときと、実績解除などの状態変化イベントで最新化する
  useEffect(() => {
    const handler = () => {
      refetch();
    };

    window.addEventListener("focus", handler);
    window.addEventListener(USER_STATUS_CHANGED_EVENT, handler);

    return () => {
      window.removeEventListener("focus", handler);
      window.removeEventListener(USER_STATUS_CHANGED_EVENT, handler);
    };
  }, [refetch]);

  return (
    <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-3">
      {/* ステータス（レベルと称号は達成した実績の数から算出） */}
      <div className="border-4 border-black bg-[#fff8dc] px-2 py-1.5 shadow-[4px_4px_0_0_#000] sm:py-2 md:px-3">
        <div className="text-[10px]">STATUS</div>

        <div className="mt-1 whitespace-nowrap text-xs md:text-sm">
          Lv.{status.level} {status.title}
        </div>
      </div>

      {/* プロフィール */}
      <Link
        href="/profile"
        className="flex min-w-0 items-center gap-3 border-4 border-black bg-[#fff8dc] px-3 py-1.5 shadow-[4px_4px_0_0_#000] transition-all hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#000] active:translate-y-[3px] active:shadow-none sm:py-2"
      >
        {/* アイコン */}
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-black bg-[#ddd] sm:h-10 sm:w-10">
          {status.image ? (
            <img
              src={status.image || "/images/default-avatar.png"}
              alt="プロフィール画像"
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>

        {/* 名前 */}
        <div className="min-w-0">
          <div className="text-[10px] opacity-70">PLAYER</div>

          <div className="max-w-[110px] truncate text-sm font-bold sm:max-w-[120px]">
            {status.name}
          </div>
        </div>
      </Link>
    </div>
  );
}
