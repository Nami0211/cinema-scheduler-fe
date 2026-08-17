import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'ui/ThemeProvider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Header from 'components/Header';
import Footer from 'components/Footer';
import StoreProvider from 'store/Provider';
import { MSWProvider } from 'components/MSWProvider';
import styles from './layout.module.css';
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Cinema Scheduler',
  description: 'Prenota i tuoi film',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <StoreProvider>
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider>
              <MSWProvider>
                <div className={styles.container}>
                  <Header />
                  <main className={styles.main}>{children}</main>
                  <Footer />
                </div>
              </MSWProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
