// レベル帯ごとの称号リスト（あんこの案。気になるものはここを直すだけでOK）
// レベルは「達成した実績の数」そのもの（実績0件なら Lv.0、実績は全49件なので最大 Lv.49）
// 称号は5レベルごとの帯で切り替わる。最後の Lv.49 は全実績達成の特別称号
export const levelTitles = [
  { minLevel: 0, title: "がんばりびと" },
  { minLevel: 5, title: "こつこつがんばりびと" },
  { minLevel: 10, title: "習慣ビルダー" },
  { minLevel: 15, title: "継続職人" },
  { minLevel: 20, title: "習慣マスター" },
  { minLevel: 25, title: "不屈の継続者" },
  { minLevel: 30, title: "ルーティンの達人" },
  { minLevel: 35, title: "継続の賢者" },
  { minLevel: 40, title: "習慣レジェンド" },
  { minLevel: 45, title: "がんばりの覇者" },
  { minLevel: 49, title: "習慣の神" },
] as const;
