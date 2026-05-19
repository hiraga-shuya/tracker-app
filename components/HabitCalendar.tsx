"use client";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type Props = {
  completedDates: Date[];
};

export default function HabitCalendar({ completedDates }: Props) {
  // 日付比較用関数
  const isCompletedDate = (date: Date) => {
    return completedDates.some((completedDate) => {
      return (
        completedDate.getFullYear() === date.getFullYear() &&
        completedDate.getMonth() === date.getMonth() &&
        completedDate.getDate() === date.getDate()
      );
    });
  };

  return (
    <div className="mt-6">
      <Calendar
        className="game-calendar"
        tileClassName={({ date, view }) => {
          if (view !== "month") return "";

          if (isCompletedDate(date)) {
            return "completed-day";
          }

          return "";
        }}
        tileContent={({ date, view }) => {
          if (view !== "month") return null;

          const isCompleted = isCompletedDate(date);

          return (
            <div className="mt-1 flex justify-center">
              {isCompleted ? (
                <span className="text-[10px] font-black">EXP</span>
              ) : null}
            </div>
          );
        }}
      />
    </div>
  );
}
