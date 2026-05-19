"use client";

import { useEffect, useRef, useState } from "react";

type AchievementMessage = {
  title: string;
};

export default function AchievementToast() {
  const [messages, setMessages] = useState<string[]>([]);
  const queueRef = useRef<string[]>([]);
  const isRunning = useRef(false);

  const processQueue = () => {
    if (isRunning.current) return;

    isRunning.current = true;

    const run = () => {
      if (queueRef.current.length === 0) {
        isRunning.current = false;
        return;
      }

      const next = queueRef.current.shift();
      if (!next) return;

      setMessages((prev) => [...prev, next]);

      setTimeout(() => {
        setMessages((prev) => prev.slice(1));
        run();
      }, 3000);
    };

    run();
  };

  const readStorage = () => {
    const raw = sessionStorage.getItem("achievement_unlock");
    if (!raw) return;

    try {
      const achievements: AchievementMessage[] = JSON.parse(raw);

      sessionStorage.removeItem("achievement_unlock");

      queueRef.current.push(...achievements.map((a) => a.title));

      processQueue();
    } catch (e) {
      console.error("toast parse error:", e);
      sessionStorage.removeItem("achievement_unlock");
    }
  };
  useEffect(() => {
    const check = () => readStorage();

    check(); // 初回

    const interval = setInterval(check, 300); // 保険

    return () => clearInterval(interval);
  }, []);

  if (messages.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3">
      {messages.map((message, index) => (
        <div
          key={`${message}-${index}`}
          className="
            border-4 border-black
            bg-yellow-300
            px-6 py-4
            shadow-[6px_6px_0_#000]
            animate-bounce
          "
        >
          <p className="text-xs font-bold tracking-widest">
            ACHIEVEMENT UNLOCKED
          </p>
          <p className="font-bold text-lg">🏆 {message}</p>
        </div>
      ))}
    </div>
  );
}
