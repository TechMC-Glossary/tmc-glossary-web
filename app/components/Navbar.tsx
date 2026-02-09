// app/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Moon, Sun, LogOut, User as UserIcon, Shield, Languages } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4 mx-auto justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="mr-6 flex items-center space-x-2 font-bold text-lg">
            <span className="text-primary">TMC</span>
            <span className="hidden sm:inline-block">Glossary</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
              {t('glossary')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
           <button
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
            className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground flex items-center gap-1 text-sm font-medium"
          >
            <Languages className="h-4 w-4" />
            {lang === 'en' ? 'EN' : '中'}
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden md:inline-block">
                {session.user?.email}
              </span>
              
              {/* @ts-ignore */}
              {session.user?.role === 'ADMIN' && (
                <Link href="/admin" className="flex items-center gap-2 text-sm font-medium text-yellow-600 dark:text-yellow-500">
                  <Shield className="h-4 w-4" />
                  {t('admin')}
                </Link>
              )}

              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                {t('logout')}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <UserIcon className="h-4 w-4" />
              {t('login')}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
