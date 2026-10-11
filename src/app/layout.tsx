import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import "./hub.css";
import "./hub-details.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "بلوكه | العقار وأكثر — كل روابطنا في مكان واحد",
  description: "حمّل تطبيق بلوكه، اكتشف عقارك القادم، وتابع حساباتنا الرسمية. كل بلوكه في مكان واحد.",
  metadataBase: new URL("https://go.blokkah.app"),
  alternates: { canonical: "/" },
  icons: { icon: "/brand/logo/darkIconLogoSquare.svg" },
  openGraph: {
    title: "بلوكه | العقار وأكثر",
    description: "تطبيقنا، موقعنا، وحساباتنا الرسمية. كل بلوكه في مكان واحد.",
    url: "https://go.blokkah.app",
    locale: "ar_SA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
