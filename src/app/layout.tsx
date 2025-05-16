import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Clerk Admin Dashboard',
  description: 'Admin dashboard for managing Clerk users',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
          <footer className="fixed bottom-0 w-full bg-gray-100 py-4 text-center text-sm text-gray-600">
            Ali Özkan Özdurmuş tarafından geliştirilmiştir
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
} 