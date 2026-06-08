import type { Metadata } from "next";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Artdict — Nghệ thuật & Quà tặng địa phương",
  description: "Artdict kết nối các nghệ sĩ sinh viên thiết kế FPT với người sưu tập Gen Z."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
