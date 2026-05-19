"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function HabitSortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") ?? "new";
  return (
    <select
      value={currentSort}
      onChange={(e) => {
        router.push(`/habit?sort=${e.target.value}`);
      }}
      className="
        border-4 border-black
        bg-white
        px-4 py-2
        font-bold
        outline-none
        cursor-pointer
      "
    >
      <option value="new">最新順</option>
      <option value="old">古い順</option>
      <option value="count">達成回数順</option>
    </select>
  );
}
