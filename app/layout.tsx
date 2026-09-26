import type { Metadata } from "next";
import { Geist, Geist_Mono, Rajdhani } from "next/font/google";
import "./globals.css";
import { CartProvider } from '@/context/CartContext'
import Header from '@/components/Header'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'
import Footer from '@/components/Footer'

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
  metadataBase: new URL('https://mrgames.com.co'),
  title: {
    default: "MrGames — Tienda de Videojuegos",
    template: "%s | MrGames",
  },
  description:
    "Catálogo de videojuegos y cuentas compartidas para Xbox, PlayStation, Switch y PC. Consulta disponibilidad inmediata o cotiza tu combo en WhatsApp.",
  keywords: [
    "videojuegos colombia",
    "juegos xbox baratos",
    "juegos ps5 colombia",
    "cuentas compartidas",
    "mr games",
    "nintendo switch colombia",
    "juegos digitales",
  ],
  openGraph: {
    title: "MrGames — Tu próximo juego te espera",
    description:
      "Catálogo de más de 600 videojuegos destacados para Xbox, PlayStation, Switch y PC. Consulta disponibilidad y cotiza combos por WhatsApp.",
    url: "https://mrgames.com.co",
    siteName: "MrGames",
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MrGames — Tienda de Videojuegos",
    description:
      "Catálogo de más de 600 videojuegos destacados para Xbox, PlayStation, Switch y PC.",
  },
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
          <Footer />
          <FloatingWhatsApp />
        </CartProvider>
      </body>
    </html>
  );
}