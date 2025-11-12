import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { MapPin, Home, Mail } from 'lucide-react';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';
import { Button } from '@/components/ui/button';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Home className="w-5 h-5" />
                  <h1 className="text-xl md:text-2xl font-bold">{SITE_NAME}</h1>
                </Link>
                <div className="flex items-center gap-2">
                  <Link href="/near-me">
                    <Button variant="outline" size="sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Near Me</span>
                    </Button>
                  </Link>
                  <a href="mailto:livebaitdirectory@gmail.com">
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Contact</span>
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </header>
          <main>{children}</main>
          <footer className="border-t mt-12">
            <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
