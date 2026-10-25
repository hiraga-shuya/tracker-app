import { put, del } from "@vercel/blob";

import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/getUserId";
import { unlockAchievement } from "@/lib/unlockAchievement";

// プロフィール画像の上限サイズ。Vercel のサーバー経由アップロードの
// リクエスト上限（約4.5MB）を超えないよう、少し余裕を持たせて 4MB にしている
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

// 画像形式から拡張子を決めるための対応表
const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

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
    const imageFile = formData.get("image"); // 画像が選ばれていれば File、なければ null

    // =========================
    // 🖼️ プロフィール画像のアップロード（画像が選ばれたときだけ）
    // 画像本体は Vercel Blob に置き、DBにはそのURLだけを保存する
    // =========================
    let newImageUrl: string | undefined;

    if (imageFile instanceof File && imageFile.size > 0) {
      if (!imageFile.type.startsWith("image/")) {
        return Response.json(
          { error: "画像ファイルを選択してください" },
          { status: 400 },
        );
      }

      if (imageFile.size > MAX_IMAGE_SIZE) {
        return Response.json(
          { error: "画像は4MB以下にしてください" },
          { status: 400 },
        );
      }

      const ext = EXT_BY_TYPE[imageFile.type] ?? "png";

      // 差し替え前の画像URLを控えておく（古いBlob画像の後片付け用）
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { image: true },
      });

      try {
        const blob = await put(
          `profiles/${userId}/avatar.${ext}`,
          imageFile,
          {
            access: "public",
            addRandomSuffix: true, // 同名でも上書きせず、新しいURLで保存する
            contentType: imageFile.type,
          },
        );

        newImageUrl = blob.url;
      } catch (e) {
        console.error(e);
        return Response.json(
          {
            error:
              "画像のアップロードに失敗しました（Blobストレージの設定を確認してください）",
          },
          { status: 500 },
        );
      }

      // 前の画像が Blob 上のものなら削除しておく（失敗しても更新自体は続行する）
      if (currentUser?.image?.includes("blob.vercel-storage.com")) {
        try {
          await del(currentUser.image);
        } catch (e) {
          console.error(e);
        }
      }
    }

    const updateData: { name: string; image?: string } = {
      name,
    };

    if (newImageUrl) {
      updateData.image = newImageUrl;
    }

    await prisma.user.update({
      where: { id: userId }, // 今回更新するユーザーIDのUserのデータを絞り込む。
      data: updateData, // updateDataに格納されたdataを更新
    });

    // =========================
    // 🏆 実績（統一版）
    // =========================
    const unlockedAchievements = [
      // 初めて名前を変更した　実績が解除される可能性があるので宣言
      ...(await unlockAchievement(userId, "first_name_change")),
      // 画像をアップロードしたときだけ、初めて画像を変更した実績も判定する
      ...(newImageUrl
        ? await unlockAchievement(userId, "first_image_change")
        : []),
    ];

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
