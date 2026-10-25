"use client";

import { useEffect, useRef, useState } from "react";

import { WEEKDAY_LABELS } from "@/lib/reminderSchedule";

type ReminderView = {
  id: string;
  title: string;
  body: string | null;
  hour: number;
  minute: number;
  daysOfWeek: number[];
  is_active: boolean;
};

type Props = {
  initialReminders: ReminderView[];
};

type PushState = "loading" | "unsupported" | "off" | "on" | "denied";

// VAPID 公開鍵（Base64URL）を subscribe 用の形式に変換する
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatDays(daysOfWeek: number[]): string {
  if (daysOfWeek.length === 7) return "毎日";

  return [...daysOfWeek]
    .sort((a, b) => a - b)
    .map((d) => WEEKDAY_LABELS[d])
    .join("・");
}

export default function ReminderManager({ initialReminders }: Props) {
  const [reminders, setReminders] = useState<ReminderView[]>(initialReminders);
  const [pushState, setPushState] = useState<PushState>("loading");
  const [pushBusy, setPushBusy] = useState(false);

  // フォームの状態（editingId があれば編集モード）
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [time, setTime] = useState("08:00");
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [saving, setSaving] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  // この端末の通知の状態を調べる
  useEffect(() => {
    const check = async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setPushState("unsupported");
        return;
      }

      if (Notification.permission === "denied") {
        setPushState("denied");
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription =
          await registration.pushManager.getSubscription();

        setPushState(subscription ? "on" : "off");
      } catch {
        setPushState("off");
      }
    };

    check();
  }, []);

  const enablePush = async () => {
    try {
      setPushBusy(true);

      const keyRes = await fetch("/api/push/public-key");

      if (!keyRes.ok) {
        const data = await keyRes.json();
        alert(data.error ?? "通知機能は現在準備中です");
        return;
      }

      const { publicKey } = await keyRes.json();

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setPushState(permission === "denied" ? "denied" : "off");
        alert("通知が許可されませんでした");
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!res.ok) {
        throw new Error("購読の保存に失敗しました");
      }

      setPushState("on");
      alert("この端末で通知を受け取るようにしました！");
    } catch (e) {
      console.error(e);
      alert("通知の設定に失敗しました");
    } finally {
      setPushBusy(false);
    }
  };

  const disablePush = async () => {
    try {
      setPushBusy(true);

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        await subscription.unsubscribe();
      }

      setPushState("off");
    } catch (e) {
      console.error(e);
      alert("通知の解除に失敗しました");
    } finally {
      setPushBusy(false);
    }
  };

  const sendTest = async () => {
    try {
      setPushBusy(true);

      const res = await fetch("/api/push/test", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? "テスト通知の送信に失敗しました");
        return;
      }

      alert(`テスト通知を送りました（${data.sent}件の端末に送信）`);
    } catch (e) {
      console.error(e);
      alert("テスト通知の送信に失敗しました");
    } finally {
      setPushBusy(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setBody("");
    setTime("08:00");
    setDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const startEdit = (reminder: ReminderView) => {
    setEditingId(reminder.id);
    setTitle(reminder.title);
    setBody(reminder.body ?? "");
    setTime(formatTime(reminder.hour, reminder.minute));
    setDays(reminder.daysOfWeek);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleDay = (day: number) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleSave = async () => {
    if (title.trim() === "") {
      alert("タイトルを入力してください");
      return;
    }

    if (days.length === 0) {
      alert("曜日を1つ以上選んでください");
      return;
    }

    const [hourStr, minuteStr] = time.split(":");
    const payload = {
      title: title.trim(),
      body: body.trim() ? body.trim() : null,
      hour: Number(hourStr),
      minute: Number(minuteStr),
      daysOfWeek: [...days].sort((a, b) => a - b),
    };

    try {
      setSaving(true);

      const res = await fetch(
        editingId ? "/api/reminders/update" : "/api/reminders",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            editingId ? { id: editingId, ...payload } : payload,
          ),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? "保存に失敗しました");
        return;
      }

      const saved = data.reminder as ReminderView;

      setReminders((prev) => {
        const next = editingId
          ? prev.map((r) => (r.id === saved.id ? saved : r))
          : [...prev, saved];

        return next.sort(
          (a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute),
        );
      });

      resetForm();
      alert(editingId ? "更新しました！" : "リマインダーを追加しました！");
    } catch (e) {
      console.error(e);
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (reminder: ReminderView) => {
    try {
      const res = await fetch("/api/reminders/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: reminder.id,
          is_active: !reminder.is_active,
        }),
      });

      if (!res.ok) {
        throw new Error("切り替えに失敗しました");
      }

      setReminders((prev) =>
        prev.map((r) =>
          r.id === reminder.id ? { ...r, is_active: !r.is_active } : r,
        ),
      );
    } catch (e) {
      console.error(e);
      alert("切り替えに失敗しました");
    }
  };

  const handleDelete = async (reminder: ReminderView) => {
    if (!window.confirm(`「${reminder.title}」を削除しますか？`)) {
      return;
    }

    try {
      const res = await fetch("/api/reminders/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reminder.id }),
      });

      if (!res.ok) {
        throw new Error("削除に失敗しました");
      }

      setReminders((prev) => prev.filter((r) => r.id !== reminder.id));

      if (editingId === reminder.id) {
        resetForm();
      }
    } catch (e) {
      console.error(e);
      alert("削除に失敗しました");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 通知の受け取り設定 */}
      <section className="game-panel">
        <p className="text-xs text-gray-500 mb-2">NOTIFICATION</p>

        <h2 className="text-lg font-bold mb-2 sm:text-xl">
          この端末で通知を受け取る
        </h2>

        {pushState === "loading" && (
          <p className="text-sm">状態を確認しています…</p>
        )}

        {pushState === "unsupported" && (
          <p className="text-sm leading-relaxed">
            このブラウザは通知に対応していません。Android の Chrome
            で開いてください。
          </p>
        )}

        {pushState === "denied" && (
          <p className="text-sm leading-relaxed">
            通知がブロックされています。ブラウザのサイト設定から、このサイトの通知を「許可」に変えてください。
          </p>
        )}

        {pushState === "off" && (
          <>
            <p className="text-sm leading-relaxed mb-3">
              まだ設定されていません。下のボタンから許可すると、この端末に通知が届くようになります。
            </p>

            <button
              onClick={enablePush}
              disabled={pushBusy}
              className="game-button w-full disabled:opacity-50"
            >
              🔔 通知を有効にする
            </button>
          </>
        )}

        {pushState === "on" && (
          <>
            <p className="text-sm leading-relaxed mb-3">
              ✅ この端末は通知を受け取る設定になっています。
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={sendTest}
                disabled={pushBusy}
                className="game-button disabled:opacity-50"
              >
                テスト通知を送る
              </button>

              <button
                onClick={disablePush}
                disabled={pushBusy}
                className="border-4 border-black bg-white px-4 py-2 font-bold shadow-[4px_4px_0_0_#000] transition-all hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#000] active:translate-y-[3px] active:shadow-none disabled:opacity-50"
              >
                この端末の通知を止める
              </button>
            </div>
          </>
        )}
      </section>

      {/* 追加・編集フォーム */}
      <section className="game-panel" ref={formRef}>
        <p className="text-xs text-gray-500 mb-2">
          {editingId ? "EDIT REMINDER" : "NEW REMINDER"}
        </p>

        <h2 className="text-lg font-bold mb-3 sm:text-xl">
          {editingId ? "リマインダーを編集" : "リマインダーを追加"}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-bold mb-1">
              タイトル（通知に出ます）
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：朝の習慣チェック"
              className="game-input"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">
              本文（任意）
            </label>

            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="例：今日のクエストを確認しよう"
              className="game-input"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">時刻</label>

            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="game-input"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">曜日</label>

            <div className="flex flex-wrap gap-2">
              {WEEKDAY_LABELS.map((label, day) => {
                const selected = days.includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`border-4 border-black px-3 py-1.5 font-bold shadow-[3px_3px_0_0_#000] transition-all active:translate-y-[2px] active:shadow-none ${
                      selected ? "bg-[#ffd54f]" : "bg-white opacity-60"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setDays([0, 1, 2, 3, 4, 5, 6])}
                className="border-4 border-black bg-[#bbdefb] px-3 py-1.5 font-bold shadow-[3px_3px_0_0_#000] transition-all active:translate-y-[2px] active:shadow-none"
              >
                毎日
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="game-button disabled:opacity-50"
            >
              {saving ? "保存中..." : editingId ? "更新する" : "追加する"}
            </button>

            {editingId && (
              <button
                onClick={resetForm}
                className="border-4 border-black bg-white px-4 py-2 font-bold shadow-[4px_4px_0_0_#000] transition-all hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#000] active:translate-y-[3px] active:shadow-none"
              >
                キャンセル
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 一覧 */}
      <section className="game-panel">
        <p className="text-xs text-gray-500 mb-2">MY REMINDERS</p>

        <h2 className="text-lg font-bold mb-3 sm:text-xl">
          登録済みリマインダー
        </h2>

        {reminders.length === 0 ? (
          <p className="text-sm text-gray-500">
            まだリマインダーがありません。上のフォームから追加できます。
          </p>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`border-4 border-black bg-white p-3 ${
                  reminder.is_active ? "" : "opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-2xl font-black">
                      {formatTime(reminder.hour, reminder.minute)}
                      <span className="ml-2 text-sm font-bold text-gray-600">
                        {formatDays(reminder.daysOfWeek)}
                      </span>
                    </p>

                    <p className="font-bold mt-1">{reminder.title}</p>

                    {reminder.body && (
                      <p className="text-sm text-gray-600 mt-0.5">
                        {reminder.body}
                      </p>
                    )}
                  </div>

                  <span
                    className={`border-2 border-black px-2 py-0.5 text-xs font-bold ${
                      reminder.is_active ? "bg-[#c8e6c9]" : "bg-[#e0e0e0]"
                    }`}
                  >
                    {reminder.is_active ? "有効" : "無効"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    onClick={() => handleToggleActive(reminder)}
                    className="border-2 border-black bg-[#fff9c4] px-3 py-1 text-sm font-bold"
                  >
                    {reminder.is_active ? "無効にする" : "有効にする"}
                  </button>

                  <button
                    onClick={() => startEdit(reminder)}
                    className="border-2 border-black bg-white px-3 py-1 text-sm font-bold"
                  >
                    編集
                  </button>

                  <button
                    onClick={() => handleDelete(reminder)}
                    className="border-2 border-black bg-[#ffcdd2] px-3 py-1 text-sm font-bold"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
