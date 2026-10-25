import type { MetadataRoute } from "next";

// PWA（ホーム画面にインストールできるWebアプリ）としての宣言。
// このファイルがあると /manifest.webmanifest が自動で配信され、
// layout 側に <link rel="manifest"> が自動で付く（Next.js の規約）。
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "習慣化頑張るくん",
    short_name: "がんばるくん",
    description: "習慣化支援アプリ",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f4ecd8",
    theme_color: "#ffd54f",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
