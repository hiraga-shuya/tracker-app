"use client";

import Image from "next/image";
import { habitIcons } from "@/src/constants/habitIcons";
import { useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function IconSelectModal({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const iconKey = value as keyof typeof habitIcons;
  const currentIcon = habitIcons[iconKey] ?? habitIcons.book;

  return (
    <div>
      <input type="hidden" name="icon_type" value={value} />

      {/* 現在のアイコン */}
      <div
        className="
          border-4 border-black
          bg-[#fff]
          p-4
          flex items-center gap-4
        "
      >
        <div
          className="
            w-20 h-20
            border-4 border-black
            bg-[#f5f5f5]
            flex items-center justify-center
            shrink-0
          "
        >
          <Image
            src={currentIcon.src}
            alt={currentIcon.label}
            width={50}
            height={50}
          />
        </div>

        <div>
          <p className="text-xs tracking-widest text-gray-500">CURRENT ICON</p>

          <p className="text-xl font-bold">{currentIcon.label}</p>
        </div>
      </div>

      {/* ボタン */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="game-button mt-4"
      >
        アイコン変更
      </button>

      {/* モーダル */}
      {open && (
        <div
          className="
            fixed inset-0
            bg-black/60
            flex items-center justify-center
            z-50
            p-4
          "
        >
          <div
            className="
              game-panel
              w-full
              max-w-3xl
              max-h-[80vh]
              overflow-y-auto
            "
          >
            {/* タイトル */}
            <div className="mb-6">
              <p className="text-sm tracking-widest text-gray-500">
                ICON SELECT
              </p>

              <h2 className="text-3xl font-bold">アイコン選択</h2>
            </div>

            {/* 一覧 */}
            <div
              className="
                grid
                grid-cols-2
                sm:grid-cols-3
                md:grid-cols-4
                gap-4
              "
            >
              {Object.entries(habitIcons).map(([key, icon]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                  className={`
                    border-4
                    p-4
                    transition-all
                    flex flex-col items-center
                    gap-3
                    hover:-translate-y-1
                    ${
                      value === key
                        ? "border-blue-500 bg-blue-100"
                        : "border-black bg-white"
                    }
                  `}
                >
                  <div
                    className="
                      w-16 h-16
                      flex items-center justify-center
                    "
                  >
                    <Image
                      src={icon.src}
                      alt={icon.label}
                      width={48}
                      height={48}
                    />
                  </div>

                  <p className="font-bold text-sm">{icon.label}</p>

                  {value === key && (
                    <p className="text-xs font-bold text-blue-700">EQUIPPED</p>
                  )}
                </button>
              ))}
            </div>

            {/* 閉じる */}
            <div className="mt-6 text-right">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="game-button"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
