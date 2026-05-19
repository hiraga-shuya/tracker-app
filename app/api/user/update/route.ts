import fs from "fs/promises";
import path from "path";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";
import { unlockAchievement } from "@/lib/unlockAchievement";

export async function POST(req: Request) {
  try {
    const userId = await getUserId(); // cookieStoreからユーザーIDを取得

    if (!userId) {
      return Response.json(
        // cookieStoreから取得したユーザーIDが空だった場合、エラー文と401を返す
        { error: "ユーザーが存在しません" },
        { status: 401 },
      );
    }

    const formData = await req.formData(); // プロフィール更新のため、formDataで送られてきた内容を取得。
    const name = formData.get("name") as string; // formDataからnameの値をstring型で取得
    const image = formData.get("image") as File | null; // formDataからimageをFileオブジェクト（name,size,typeなどを持つ） or nullで取得

    let imagePath: string | undefined; // imagePath変数をstring型 or undefinedで宣言。この時点では中身が空。

    if (image && image.size > 0) {
      // imageが存在し、ファイルサイズが0より大きい場合
      const bytes = await image.arrayBuffer(); // 画像をバイナリデータとして取得
      const buffer = Buffer.from(bytes); // バイナリデータをNode.jsで扱えるBuffer形式に変換

      const fileName = `${Date.now()}-${image.name}`; //fileNameを定義する変数に、$今日の日付$-$画像の名前$という値を格納
      const uploadDir = path.join(process.cwd(), "public/uploads"); // 画像保存先フォルダの絶対パスを作っている

      await fs.mkdir(uploadDir, { recursive: true }); // uploadsフォルダが無ければ作成

      const filePath = path.join(uploadDir, fileName); // 保存する画像ファイルのフルパスを生成

      await fs.writeFile(filePath, buffer); // Buffer化した画像データをサーバーに保存

      imagePath = `/uploads/${fileName}`;
    }

    const updateData: {
      // updateDataオブジェクトの型定義（nameは必須、imageは任意）
      name: string;
      image?: string;
    } = {
      name: name, // nameというupdateDataの箱に、nameの値を格納している
    };

    if (imagePath) {
      updateData.image = imagePath; // DBに格納するimageカラムの内容について、imagePathの内容に更新する
    }

    await prisma.user.update({
      where: { id: userId }, // 今回更新するユーザーIDのUserのデータを絞り込む。
      data: updateData, // updateDataに格納されたdataを更新
    });

    // =========================
    // 🏆 実績（統一版）
    // =========================
    const unlockedAchievements = await Promise.all([
      // この操作で解除される可能性がある実績を発火。
      unlockAchievement(userId, "first_name_change"), // 初めて名前を変更した　実績が解除される可能性があるので宣言
      unlockAchievement(userId, "first_image_change"), // 初めて画像を変更した　実績が解除される可能性があるので宣言
    ]).then((results) => results.flat());

    return Response.json({
      success: true,
      unlockedAchievements,
    });
  } catch (e) {
    // try内でエラーがあった場合、エラー文とともに500を返す
    console.error(e);
    return Response.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
