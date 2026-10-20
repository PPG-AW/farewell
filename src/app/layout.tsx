import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Inter, Caveat } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });

export const metadata: Metadata = {
  title: "Jejak Langkah Guru Matematika — PPG Prajabatan 2026 · UKSW",
  description:
    "Dunia 3D interaktif perpisahan PPG Prajabatan 2026 Prodi Matematika, Universitas Kristen Satya Wacana, Salatiga. Dari angka dan rumus, kita menjadi guru yang mengubah dunia.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={`${fraunces.variable} ${inter.variable} ${caveat.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
