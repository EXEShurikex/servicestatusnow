import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ServiceStatusNow - Check if a website or app is down right now',
  description: 'Live outage reports and service status updates for popular websites, apps, and services. Real-time status monitoring for social media, banking, gaming, streaming and more.',
  metadataBase: new URL('https://servicestatusnow.com'),
  keywords: ['service status', 'outage', 'down detector', 'website down', 'app status', 'is down'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
