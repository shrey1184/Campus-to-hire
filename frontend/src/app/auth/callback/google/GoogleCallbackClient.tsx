"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { authApi } from "@/lib/api";
import { Loader2 } from "lucide-react";

// Module-level flag survives component remounts
let googleCallbackProcessed = false;

export default function GoogleCallbackClient() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    if (googleCallbackProcessed) return;
    googleCallbackProcessed = true;

    const handleCallback = async () => {
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

      try {
        const authResult = await authApi.googleCallback(code);
        await login(authResult.access_token);
        router.push("/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication failed.");
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    handleCallback();

    return () => {
      googleCallbackProcessed = false;
    };
  }, [router, login]);

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
