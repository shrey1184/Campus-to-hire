"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { authApi } from "@/lib/api";
import { Loader2 } from "lucide-react";
import type { AuthResponse } from "@/types";

// Deduplicate code exchanges in React Strict Mode/dev remounts.
const googleExchangePromises = new Map<string, Promise<AuthResponse>>();

function exchangeGoogleCodeOnce(code: string): Promise<AuthResponse> {
  const existing = googleExchangePromises.get(code);
  if (existing) return existing;

  const promise = authApi.googleCallback(code).finally(() => {
    setTimeout(() => {
      googleExchangePromises.delete(code);
    }, 5 * 60 * 1000);
  });
  googleExchangePromises.set(code, promise);
  return promise;
}

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");

  useEffect(() => {
    let cancelled = false;

    const handleCallback = async () => {
      if (errorParam) {
        if (!cancelled) {
          setError("Google authentication failed. Please try again.");
          setTimeout(() => router.replace("/login"), 3000);
        }
        return;
      }

      if (!code) {
        if (!cancelled) {
          setError("No authorization code received from Google.");
          setTimeout(() => router.replace("/login"), 3000);
        }
        return;
      }

      try {
        const authResult = await exchangeGoogleCodeOnce(code);
        if (cancelled) return;
        await login(authResult.access_token);
        router.replace("/dashboard");
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Authentication failed. Please retry from the login page."
          );
          setTimeout(() => router.replace("/login"), 3000);
        }
      }
    };

    handleCallback();
    return () => {
      cancelled = true;
    };
  }, [code, errorParam, router, login]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 cyber-page">
      <div className="w-full max-w-md text-center rounded-2xl p-6 sm:p-7 cyber-panel-soft cyber-loading-panel">
        {error ? (
          <div>
            <div className="mb-3 text-sm text-destructive">{error}</div>
            <p className="cyber-micro text-muted-foreground">
              Redirecting to login...
            </p>
          </div>
        ) : (
          <div>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary cyber-spinner" />
            <p className="mt-3 cyber-micro text-muted-foreground">
              Completing sign in...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
