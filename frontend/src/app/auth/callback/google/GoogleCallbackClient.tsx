"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { authApi } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function GoogleCallbackClient() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const errorParam = params.get("error");

    if (errorParam) {
      setError("Authentication failed. Please try again.");
      setTimeout(() => router.push("/login"), 3000);
      return;
    }

    if (!code) {
      setError("No authorization code received.");
      setTimeout(() => router.push("/login"), 3000);
      return;
    }

    // Guard against React StrictMode double-invocation and same-session re-visits.
    // Each Google authorization code is single-use, so we key by the code itself.
    const sessionKey = `google_oauth_processed_${code}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, "true");

    const handleCallback = async () => {
      try {
        const authResult = await authApi.googleCallback(code);
        await login(authResult.access_token);
        router.push("/dashboard");
      } catch (err) {
        // Remove the guard so the user can retry via a fresh OAuth flow
        sessionStorage.removeItem(sessionKey);
        setError(err instanceof Error ? err.message : "Authentication failed.");
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    handleCallback();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        {error ? (
          <div>
            <div className="mb-4 text-destructive">{error}</div>
            <p className="text-sm text-muted-foreground">Redirecting to login...</p>
          </div>
        ) : (
          <div>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Completing sign in...</p>
          </div>
        )}
      </div>
    </div>
  );
}
