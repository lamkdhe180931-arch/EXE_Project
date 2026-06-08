import type { Metadata } from "next";
import Script from "next/script";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { MenuOverlay } from "@/components/site/MenuOverlay";
import "./globals.css";

export const metadata: Metadata = {
  title: "Artdict — Nghệ thuật & Quà tặng địa phương",
  description: "Artdict kết nối các nghệ sĩ sinh viên thiết kế FPT với người sưu tập Gen Z."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Script src="/main.js" strategy="beforeInteractive" />
        <Header />
        <MenuOverlay />
        {children}
        <Footer />
      </body>
    </html>
  );
}
