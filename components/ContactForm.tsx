"use client";

import Link from "next/link";
import { useState } from "react";

const CATEGORIES = ["不具合の報告", "要望", "その他"];

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  // スパム対策のハニーポット（人間には見えない欄）
  const [website, setWebsite] = useState("");

  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (sending) return;

    setError(null);

    if (!email.trim() || !subject.trim() || !body.trim()) {
      setError("メールアドレス・件名・内容は必須です");
      return;
    }

    setSending(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          category,
          subject,
          body,
          website,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error ?? "送信に失敗しました");
      }

      setSent(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "送信に失敗しました",
      );
    } finally {
      setSending(false);
    }
  };

  // 送信が完了したら、完了画面に切り替える
  if (sent) {
    return (
      <div className="space-y-6 pb-28">
        <section className="game-panel">
          <p className="text-sm tracking-widest text-gray-600">SUPPORT</p>

          <h1 className="text-3xl font-bold mb-3">送信しました</h1>

          <p className="text-sm opacity-80 leading-relaxed">
            お問い合わせありがとうございます。
            内容を確認のうえ、入力いただいたメールアドレスへ返信します。
          </p>
        </section>

        <Link href="/" className="game-button inline-block">
          ホームへ戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28">
      <section className="game-panel">
        <p className="text-sm tracking-widest text-gray-600">SUPPORT</p>

        <h1 className="text-3xl font-bold mb-3">お問い合わせ</h1>

        <p className="text-sm opacity-80 leading-relaxed">
          不具合の報告や、機能の要望などをお送りください。
          返信は、入力いただいたメールアドレス宛に行います。
        </p>
      </section>

      <section className="game-panel space-y-5">
        {/* お名前（任意） */}
        <div>
          <p className="mb-2 text-sm font-bold tracking-widest">
            お名前（任意）
          </p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            placeholder="お名前"
            className="game-input w-full"
          />
        </div>

        {/* メールアドレス（返信用） */}
        <div>
          <p className="mb-2 text-sm font-bold tracking-widest">
            メールアドレス（返信用）*
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={200}
            placeholder="example@mail.com"
            className="game-input w-full"
          />
        </div>

        {/* 種類 */}
        <div>
          <p className="mb-2 text-sm font-bold tracking-widest">種類 *</p>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="game-input w-full"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* 件名 */}
        <div>
          <p className="mb-2 text-sm font-bold tracking-widest">件名 *</p>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={100}
            placeholder="件名"
            className="game-input w-full"
          />
        </div>

        {/* 内容 */}
        <div>
          <p className="mb-2 text-sm font-bold tracking-widest">内容 *</p>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={5000}
            rows={8}
            placeholder="お問い合わせ内容を入力してください"
            className="game-input w-full"
          />
        </div>

        {/* ハニーポット（画面には表示しない） */}
        <input
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        {error && (
          <p className="border-2 border-black bg-[#ffcdd2] px-3 py-2 text-sm font-bold">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={sending}
          className="game-button w-full text-lg disabled:opacity-50"
        >
          {sending ? "送信中..." : "送信する"}
        </button>
      </section>
    </div>
  );
}
