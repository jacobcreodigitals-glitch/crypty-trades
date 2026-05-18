import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Crypty Trades',
  description: 'Track your crypto trades with Supabase and Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-white antialiased">
        {children}
      </body>
    </html>
  );
}
