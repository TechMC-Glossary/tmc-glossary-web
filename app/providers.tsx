// app/providers.tsx
'use client';

import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { LanguageProvider } from './hooks/useLanguage';
import RecaptchaProvider from '@/components/providers/RecaptchaProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RecaptchaProvider>
        <LanguageProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster />
          </ThemeProvider>
        </LanguageProvider>
      </ RecaptchaProvider>
    </SessionProvider>
  );
}
