import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import AuthProvider from "@/components/AuthProvider";
import { NotificationProvider } from "@/components/NotificationProvider";
import GlobalNotifications from "@/components/GlobalNotifications";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TechStore - Tienda de Tecnología",
  description: "La mejor tienda de tecnología online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NotificationProvider>
          <AuthProvider>
            <Header />
            {children}
            <GlobalNotifications />
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
