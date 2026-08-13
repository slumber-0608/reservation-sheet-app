import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "予約表ジェネレーター",
  description: "任意の月のA4予約表を、1日1ページでまとめて生成・印刷できます。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

