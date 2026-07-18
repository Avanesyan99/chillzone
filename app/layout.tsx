import type { Metadata } from 'next';
import { CartProvider } from '@/lib/cart-context';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { ConsentProvider } from '@/lib/consent-context';
import Navbar from '@/components/Navbar';
import CookieBanner from '@/components/CookieBanner';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'CHILLZONE — Outdoor & Lifestyle Gear',
  description: 'Stay Refreshed. Go Anywhere. Vasos, termos y accesorios Stanley.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="dark">
      <body>
        <ConsentProvider>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <Navbar />
                <main>{children}</main>
                <Footer />
                <CookieBanner />
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </ConsentProvider>
      </body>
    </html>
  );
}
