// お問い合わせの送信API。
// 送信先のメールアドレスはコードには書かず、環境変数 CONTACT_TO_EMAIL から読む。
// （画面にもコードにも、宛先アドレスは一切出ない作りにしている）
import { Resend} from "resend";

// 送信に使う環境変数
// - RESEND_API_KEY：メール送信サービス Resend のAPIキー
// - CONTACT_TO_EMAIL：お問い合わせの届け先メールアドレス
// - CONTACT_FROM_EMAIL：送信元（任意。自分のドメインを Resend で認証した場合に使う）

const CATEGORIES = ["不具合の報告", "要望", "その他"] as const;

const MAX_LENGTH = {
name: 50,
email: 200,
subject: 100,
body: 5000,
};

export async function POST(req: Request) {
try {
const data = await req.json();

// スパム対策のハニーポット：人間には見えない欄。
// ここに値が入っていたら自動送信とみなし、送らずに成功扱いで返す
if (typeof data.website === "string" && data.website!== "") {
return Response.json({ success: true});
}

const name = typeof data.name === "string"? data.name.trim(): "";
const email = typeof data.email === "string"? data.email.trim(): "";
const category =
typeof data.category === "string"? data.category.trim(): "";
const subject =
typeof data.subject === "string"? data.subject.trim(): "";
const body = typeof data.body === "string"? data.body.trim(): "";

// 入力チェック（画面側でも行うが、サーバー側でも必ず確認する）
if (!email ||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
return Response.json(
{ error: "メールアドレスの形式が正しくありません"},
{ status: 400},
);
}

if (!(CATEGORIES as readonly string[]).includes(category)) {
return Response.json(
{ error: "お問い合わせの種類を選択してください"},
{ status: 400},
);
}

if (!subject) {
return Response.json(
{ error: "件名を入力してください"},
{ status: 400},
);
}

if (!body) {
return Response.json(
{ error: "お問い合わせ内容を入力してください"},
{ status: 400},
);
}

if (
name.length > MAX_LENGTH.name ||
email.length > MAX_LENGTH.email ||
subject.length > MAX_LENGTH.subject ||
body.length > MAX_LENGTH.body
) {
return Response.json(
{ error: "入力が長すぎます"},
{ status: 400},
);
}

const apiKey = process.env.RESEND_API_KEY;
const to = process.env.CONTACT_TO_EMAIL;

if (!apiKey ||!to) {
// 送信設定がまだ済んでいない状態。アプリ自体は通常どおり動き、
// お問い合わせだけが「準備中」になる
console.error("お問い合わせの送信設定（環境変数）が不足しています");
return Response.json(
{ error: "お問い合わせフォームは現在準備中です"},
{ status: 503},
);
}

const from =
process.env.CONTACT_FROM_EMAIL??
"習慣化頑張るくん <onboarding@resend.dev>";

const resend = new Resend(apiKey);

const { error} = await resend.emails.send({
from,
to,
replyTo: email, // 届いたメールにそのまま返信すると、送信者に返せる
subject: `${category}：${subject}`,
text: [
"習慣化頑張るくんのお問い合わせフォームから送信されました。",
"",
`■ 種類：${category}`,
`■ お名前：${name || "（未入力）"}`,
`■ メールアドレス：${email}`,
`■ 件名：${subject}`,
"",
"■ 内容：",
body,
].join("\n"),
});

if (error) {
console.error(error);
return Response.json(
{ error: "送信に失敗しました。時間をおいて再度お試しください"},
{ status: 500},
);
}

return Response.json({ success: true});
} catch (e) {
console.error(e);
return Response.json(
{ error: "送信に失敗しました"},
{ status: 500},
);
}
}
