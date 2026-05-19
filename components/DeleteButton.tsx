"use client"; //ユーザー画面で操作した内容をAPIに送信する際、useStateやuseRouterを使用する必要があるため、Client Componentにする

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  //idとredirectToについて、親componentから取得
  id: string;
  redirectTo?: string;
};

export default function DeleteButton({ id, redirectTo }: Props) {
  const router = useRouter(); //router機能を使うためにuseRouterの機能をrouter変数に格納

  const [loading, setLoading] = useState(false);
  // loading=初期値
  // setLoading=loading更新用の関数
  // useState(false)=loadingをfalseにセット。通信してないよ状態にする

  const handleDelete = async () => {
    //onClick=handleDeleteが押されたら発火
    if (loading) return; // loadingがtrueになっていれば何もせずにreturn。連打防止処置

    setLoading(true); // loadingをtrueにセット。

    try {
      const res = await fetch("/api/habit/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }), //「/api/habit/delete」に対し、削除対象のタスクIDをjson形式でPOST送信
      });

      if (!res.ok) {
        // API送信で何かしらエラーがかえって来たらエラー文を表示
        throw new Error("Failed to delete");
      }

      if (redirectTo) {
        // 親componentからredirectToの指定があるか判定
        router.push(redirectTo); // あれば、router.pushで特定のディレクトリに遷移させる
      } else {
        router.refresh(); // なければ、このままServer Componentの最新データを再取得
      }
    } catch (e) {
      // try内でエラーがかえって来た場合、エラー文など表示させる
      console.error(e);
      alert("削除に失敗しました");
    } finally {
      // tryの成功有無にかかわらず、通信中状態を解除する
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="
        border-4
        border-black
        bg-red-400
        px-3
        py-2
        font-bold
        shadow-[4px_4px_0_0_#000]
        transition-all
        hover:translate-y-[1px]
        hover:shadow-[2px_2px_0_0_#000]
        active:translate-y-[3px]
        active:shadow-none
      "
    >
      {loading ? "削除中..." : "削除"}
    </button>
  );
}
