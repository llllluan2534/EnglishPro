import type { Metadata } from "next";
import { Inter, Outfit, Fraunces, JetBrains_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import QueryProvider from "@/components/providers/QueryProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "vietnamese"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "EnglishPro — Ôn luyện tiếng Anh cấp 3",
  description: "Nền tảng học và ôn tập tiếng Anh hiệu quả dành cho học sinh THPT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${outfit.variable} ${fraunces.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col selection:bg-accent/10 selection:text-accent">
        <SessionProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
