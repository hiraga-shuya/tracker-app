import HabitForm from "@/components/HabitForm";

export default function NewHabit() {
  return (
    <div className="space-y-6">
      {/* タイトル */}
      <section className="game-panel">
        <p className="text-sm tracking-widest text-gray-600">NEW QUEST</p>

        <h1 className="text-3xl font-bold mt-2">習慣を追加</h1>

        <p className="mt-4 leading-relaxed">
          まずは小さな習慣から始めよう！
          <br />
          毎日の積み重ねが、未来の自分を育てる。
        </p>
      </section>

      {/* フォーム */}
      <HabitForm mode="create" />
    </div>
  );
}
