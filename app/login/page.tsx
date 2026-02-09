'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  
  const { executeRecaptcha } = useGoogleReCaptcha();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    
    if (!executeRecaptcha) {
        console.log("Recaptcha not ready");
    }

    const token = executeRecaptcha ? await executeRecaptcha('login') : "";

    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
      captchaToken: token, 
    });
    setLoading(false);

    if (result?.error) {
      toast.error(result.error || 'Invalid email or password');
    } else {
      toast.success('Logged in successfully');
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg border border-border shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">Enter your credentials to access your account</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="email">Email</label>
            <input
              {...register('email')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              id="email"
              type="email"
              placeholder="m@example.com"
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none" htmlFor="password">Password</label>
            <input
              {...register('password')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              id="password"
              type="password"
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="underline hover:text-primary">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
