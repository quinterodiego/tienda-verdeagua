import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import { NotificationProvider } from "@/components/NotificationProvider";
import GlobalNotifications from "@/components/GlobalNotifications";
import StructuredData from "@/components/StructuredData";
import { ResourcePreloader } from "@/components/Preloader";
import { generateMetadata as createMetadata, siteConfig } from "@/lib/metadata";
import ThemeProvider from "@/components/ThemeProvider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = createMetadata({
  title: 'Productos Únicos y Personalizados',
  description: siteConfig.description,
  type: 'website'
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme-preferences');
                  if (stored) {
                    var theme = JSON.parse(stored).state.theme;
                    var isDark = false;
                    
                    if (theme === 'dark') {
                      isDark = true;
                    } else if (theme === 'auto') {
                      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    }
                    
                    if (isDark) {
                      document.documentElement.classList.add('dark');
                      document.documentElement.style.colorScheme = 'dark';
                    } else {
                      document.documentElement.classList.remove('dark');
                      document.documentElement.style.colorScheme = 'light';
                    }
                  } else {
                    // Default to auto mode
                    var isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (isDark) {
                      document.documentElement.classList.add('dark');
                      document.documentElement.style.colorScheme = 'dark';
                    }
                  }
                } catch (e) {
                  console.error('Error applying theme:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${poppins.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider>
          <NotificationProvider>
            <AuthProvider>
              <ResourcePreloader />
              <StructuredData />
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              <GlobalNotifications />
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
