// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saltAndHashPassword } from '@/lib/password';
import { z } from 'zod';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { cookies } from 'next/headers';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  captchaToken: z.string()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, captchaToken } = registerSchema.parse(body);

    // Verify Captcha
    const isValidCaptcha = await verifyRecaptcha(captchaToken);
    
    if (!isValidCaptcha) {
        return NextResponse.json({ error: 'Recaptcha verification failed' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await saltAndHashPassword(password);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        emailVerified: null, // No longer strictly enforcing this via blocking login
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: (error as any).errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
