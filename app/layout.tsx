import type { Metadata } from "next";
import { Geist, Geist_Mono, Rajdhani } from "next/font/google";
import "./globals.css";
import { CartProvider } from '@/context/CartContext'
import Header from '@/components/Header'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const rajdhani = Rajdhani({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "MrGames — Tienda de Videojuegos",
  description: "Videojuegos, consolas y cuentas compartidas para Xbox, PlayStation, Switch y PC.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${rajdhani.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-navy-950 text-gray-100">
        <CartProvider>
          <Header />
          {children}
          <FloatingWhatsApp />
        </CartProvider>
      </body>
    </html>
  );
}