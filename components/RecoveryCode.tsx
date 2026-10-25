"use client";

import { useState } from "react";

// プロフィール画面に自分の復旧コードを表示する部品。
// 復旧コードはユーザーIDそのもので、知っている人は誰でも
// そのユーザーの記録を開けてしまうので、取り扱い注意の文言を添えている。
export default function RecoveryCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // コピーできない環境では、欄をタップして手動コピーしてもらう
      console.error(e);
    }
  };

  return (
    <div className="game-panel">
      <p className="text-xs text-gray-500 mb-2">RECOVERY CODE</p>

      <p className="text-sm leading-relaxed mb-3">
        ブラウザを変えたり初期化したりしたときは、このコードを入力すると
        今までの記録を引き継いで再開できます。
        パスワード管理アプリやメモに控えておいてください。
      </p>

      <div className="flex gap-3 mb-3">
        <input
          readOnly
          value={code}
          onFocus={(e) => e.target.select()}
          className="game-input flex-1 text-xs"
          aria-label="復旧コード"
        />

        <button
          onClick={handleCopy}
          className="game-button whitespace-nowrap"
        >
          {copied ? "コピー済み！" : "コピー"}
        </button>
      </div>

      <p className="text-xs font-bold text-red-700 leading-relaxed">
        ⚠ このコードを知っている人は、誰でもあなたの記録を開けます。
        人に教えないでください。コードをなくすと復旧できません。
      </p>
    </div>
  );
}
