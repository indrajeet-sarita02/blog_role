import type { Metadata } from 'next';
import { Providers } from '@/lib/auth/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Blog Application',
  description: 'A production-ready blog application built with Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}