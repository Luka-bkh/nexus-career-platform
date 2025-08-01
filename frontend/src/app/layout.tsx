import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "넥서스 - 미래형 인공지능 진로체험",
  description: "AI 기반 진로 탐색 및 체험 서비스",
  keywords: ["진로체험", "AI", "인공지능", "진로탐색", "직업체험"],
  authors: [{ name: "넥서스 팀" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}