import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import { NotificationProvider } from "@/components/NotificationProvider";
import GlobalNotifications from "@/components/GlobalNotifications";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Verde Agua Personalizados - Productos Únicos",
  description: "Tienda online de productos personalizados: agendas, tazas, llaveros, stickers, cuadernos y más. Dale tu toque personal a tus estudios con Verde Agua Personalizados.",
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${poppins.variable} antialiased min-h-screen flex flex-col`}
      >
        <NotificationProvider>
          <AuthProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <GlobalNotifications />
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
