import type { Metadata } from "next";
import { Figtree, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  variable: "--font-outfit",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nice HVH — Panel bota Discord",
  description: "Panel administracyjny bota Discord (moderacja, ustawienia serwera)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${outfit.variable} ${figtree.variable}`}>
      <body>{children}</body>
    </html>
  );
}
