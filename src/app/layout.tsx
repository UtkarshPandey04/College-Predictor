import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import Toast from '@/components/Toast';

export const metadata: Metadata = {
  title: 'UnivFind – Discover Your Perfect College',
  description: 'Search, compare and discover top colleges across India. Detailed rankings, placements, fees and student reviews.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Toast />
        </AuthProvider>
      </body>
    </html>
  );
}
