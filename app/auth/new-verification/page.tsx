// app/auth/new-verification/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { newVerification } from "@/actions/new-verification";
import { Loader2 } from "lucide-react";

export default function NewVerificationPage() {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const onSubmit = useCallback(() => {
    if (success || error) return;

    if (!token) {
      setError("Missing token!");
      return;
    }

    newVerification(token)
      .then((data) => {
        setSuccess(data.success);
        setError(data.error);
        if (data.success) {
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        }
      })
      .catch(() => {
        setError("Something went wrong!");
      });
  }, [token, success, error, router]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="border p-8 rounded-lg shadow-md bg-white w-[400px] text-center">
            <h1 className="text-2xl font-bold mb-4">Confirming your email</h1>
            
            {!success && !error && (
                <div className="flex justify-center">
                   <Loader2 className="animate-spin h-8 w-8" />
                </div>
            )}

            {success && (
                <div className="bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-500 justify-center">
                    <p>{success}</p>
                </div>
            )}

            {error && (
                <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive justify-center text-red-500 bg-red-50">
                    <p>{error}</p>
                </div>
            )}
            
            {success && <p className="mt-4 text-sm text-gray-500">Redirecting to login...</p>}
            
            <button onClick={() => router.push("/login")} className="mt-6 text-sm underline">
                Back to login
            </button>
        </div>
    </div>
  );
}
