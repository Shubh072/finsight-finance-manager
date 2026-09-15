import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Finsight — Personal finance, with clarity',
  description: 'A focused view of your money, built for better decisions.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
