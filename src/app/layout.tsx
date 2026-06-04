import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Playfair_Display, Noto_Serif_SC } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "平行宇宙日报 | Parallel Universe Daily",
  description: "你每天都在创造平行宇宙的历史，只是今天才发现。",
  icons: {
    icon: "/icon-192.svg",
    apple: "/icon-512.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#A78BFA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${jetbrainsMono.variable} ${playfair.variable} ${notoSerifSC.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col noise-overlay">
        {children}
        <Script
          id="sw-register"
          strategy="afterInteractive"
        >{`if ('serviceWorker' in navigator && location.protocol === 'https:') { navigator.serviceWorker.register('/sw.js').catch(() => {}); } else if ('serviceWorker' in navigator && location.protocol === 'http:') { navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister())).catch(() => {}); }`}</Script>
      </body>
    </html>
  );
}
