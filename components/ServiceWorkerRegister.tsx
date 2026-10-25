"use client";

import { useEffect } from "react";

// Service Worker（public/sw.js）を登録するための部品。
// 画面には何も表示しない。
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Service Worker の登録に失敗しました", error);
      });
    }
  }, []);

  return null;
}
