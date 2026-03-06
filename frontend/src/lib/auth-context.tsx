"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import type { UserProfile } from "@/types";
import { profileApi, setToken, clearToken, ApiError } from "@/lib/api";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const fetchingRef = useRef(false);

  // Read token from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) {
      setToken(stored);
      setTokenState(stored);
    }
    setHydrated(true);
  }, []);

  const fetchUser = useCallback(async () => {
    // Prevent overlapping fetches
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const profile = await profileApi.get();
      setUser(profile);
    } catch (err) {
      // Only log out on auth errors (401/403), not on transient errors like 429
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setUser(null);
        clearToken();
        setTokenState(null);
      }
      // For 429 or network errors, just leave user as null without clearing token
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!token || user) return;
    void fetchUser();
  }, [fetchUser, token, user]);

  const loading = !hydrated || Boolean(token && !user);

  const login = useCallback(async (newToken: string) => {
    setToken(newToken);
    setTokenState(newToken);
    await fetchUser();
  }, [fetchUser]);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
