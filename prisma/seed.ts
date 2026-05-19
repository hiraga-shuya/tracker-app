import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.achievement.createMany({
    data: [
      // =========================
      // ■ アプリ起動実績
      // =========================
      { key: "login_1", title: "初めてアプリを起動した" },
      { key: "login_5", title: "アプリを5日起動した" },
      { key: "login_10", title: "アプリを10日起動した" },
      { key: "login_15", title: "アプリを15日起動した" },
      { key: "login_20", title: "アプリを20日起動した" },
      { key: "login_30", title: "アプリを30日起動した" },
      { key: "login_60", title: "アプリを60日起動した" },

      // =========================
      // ■ クエスト連続達成実績
      // =========================
      { key: "streak_3", title: "3日連続達成" },
      { key: "streak_5", title: "5日連続達成" },
      { key: "streak_7", title: "7日連続達成" },
      { key: "streak_14", title: "14日連続達成" },
      { key: "streak_30", title: "30日連続達成" },

      // =========================
      // ■ クエスト合計達成実績
      // =========================
      { key: "total_20", title: "合計20回達成" },
      { key: "total_50", title: "合計50回達成" },
      { key: "total_100", title: "合計100回達成" },
      { key: "total_200", title: "合計200回達成" },
      { key: "total_300", title: "合計300回達成" },

      // =========================
      // ■ カテゴリ実績（運動）
      // =========================
      { key: "sport_1", title: "運動カテゴリを1回達成" },
      { key: "sport_10", title: "運動カテゴリを10回達成" },
      { key: "sport_20", title: "運動カテゴリを20回達成" },
      { key: "sport_50", title: "運動カテゴリを50回達成" },

      // =========================
      // ■ カテゴリ実績（勉強）
      // =========================
      { key: "study_1", title: "勉強カテゴリを1回達成" },
      { key: "study_10", title: "勉強カテゴリを10回達成" },
      { key: "study_20", title: "勉強カテゴリを20回達成" },
      { key: "study_50", title: "勉強カテゴリを50回達成" },

      // =========================
      // ■ カテゴリ実績（趣味）
      // =========================
      { key: "hobby_1", title: "趣味カテゴリを1回達成" },
      { key: "hobby_10", title: "趣味カテゴリを10回達成" },
      { key: "hobby_20", title: "趣味カテゴリを20回達成" },
      { key: "hobby_50", title: "趣味カテゴリを50回達成" },

      // =========================
      // ■ カテゴリ実績（読書）
      // =========================
      { key: "book_1", title: "読書カテゴリを1回達成" },
      { key: "book_10", title: "読書カテゴリを10回達成" },
      { key: "book_20", title: "読書カテゴリを20回達成" },
      { key: "book_50", title: "読書カテゴリを50回達成" },

      // =========================
      // ■ カテゴリ実績（お金）
      // =========================
      { key: "money_1", title: "お金カテゴリを1回達成" },
      { key: "money_10", title: "お金カテゴリを10回達成" },
      { key: "money_20", title: "お金カテゴリを20回達成" },
      { key: "money_50", title: "お金カテゴリを50回達成" },

      // =========================
      // ■ カテゴリ実績（食事）
      // =========================
      { key: "food_1", title: "食事カテゴリを1回達成" },
      { key: "food_10", title: "食事カテゴリを10回達成" },
      { key: "food_20", title: "食事カテゴリを20回達成" },
      { key: "food_50", title: "食事カテゴリを50回達成" },

      // =========================
      // ■ カテゴリ実績（生活・健康）
      // =========================
      { key: "health_1", title: "生活・健康カテゴリを1回達成" },
      { key: "health_10", title: "生活・健康カテゴリを10回達成" },
      { key: "health_20", title: "生活・健康カテゴリを20回達成" },
      { key: "health_50", title: "生活・健康カテゴリを50回達成" },

      // =========================
      // ■ その他
      // =========================
      { key: "first_name_change", title: "初めて名前を変更した" }, //実装済み
      { key: "first_image_change", title: "初めて画像を変更した" }, //実装済み
      { key: "first_habit_create", title: "初めて習慣クエストを作成した" }, //実装済み
      { key: "first_habit_done", title: "初めて習慣クエストをクリアした" }, //実装済み
    ],
  });
}

main()
  .then(() => {
    console.log("seed完了");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
