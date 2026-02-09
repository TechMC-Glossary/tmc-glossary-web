// auth.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { z } from 'zod';
import { prisma } from './lib/prisma';
import { verifyPassword } from './lib/password';
import { verifyRecaptcha } from './lib/recaptcha';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      async authorize(credentials) {
        const captchaToken = credentials.captchaToken as string;
        // Verify captcha if present, or enforce it. 
        // For security, enforcing is better.
        const isHuman = await verifyRecaptcha(captchaToken);
        if (!isHuman) {
            console.log('Recaptcha verification failed');
            return null;
        }

        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;

          // No email verification check anymore
          
          if (user.password) {
             const passwordsMatch = await verifyPassword(password, user.password);
             if (passwordsMatch) return user;
          }
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" }, // Force JWT because we use Credentials too
});
