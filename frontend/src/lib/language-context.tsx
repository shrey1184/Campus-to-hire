"use client";

import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { profileApi, translateApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGE_OPTIONS,
  type LanguageCode,
  t as translateStatic,
} from "@/lib/translations";

type TranslationParams = Record<string, string | number>;

interface LanguageContextValue {
  language: LanguageCode;
  isUpdatingLanguage: boolean;
  setLanguage: (language: LanguageCode) => Promise<void>;
  t: (key: string, params?: TranslationParams) => string;
  translateText: (text: string, targetLanguage?: LanguageCode) => Promise<string>;
}

const STORAGE_KEY = "preferred_language";

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function isLanguageCode(value: string | null | undefined): value is LanguageCode {
  return SUPPORTED_LANGUAGE_OPTIONS.some((option) => option.code === value);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user, refreshUser } = useAuth();
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);
  const cacheRef = useRef(new Map<string, string>());

  useEffect(() => {
    let storedLanguage: LanguageCode = DEFAULT_LANGUAGE;

    if (isLanguageCode(user?.preferred_language)) {
      storedLanguage = user.preferred_language;
    } else if (typeof window !== "undefined") {
      const localLanguage = localStorage.getItem(STORAGE_KEY);
      if (isLanguageCode(localLanguage)) {
        storedLanguage = localLanguage;
      }
    }

    setLanguageState(storedLanguage);
  }, [user?.preferred_language]);

  const setLanguage = useCallback(async (nextLanguage: LanguageCode) => {
    const previousLanguage = language;

    setLanguageState(nextLanguage);

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, nextLanguage);
    }

    if (!user) {
      return;
    }

    setIsUpdatingLanguage(true);
    try {
      await profileApi.update({ preferred_language: nextLanguage });
      await refreshUser();
    } catch (error) {
      setLanguageState(previousLanguage);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, previousLanguage);
      }
      throw error;
    } finally {
      setIsUpdatingLanguage(false);
    }
  }, [language, user, refreshUser]);

  const translateText = useCallback(async (text: string, targetLanguage?: LanguageCode) => {
    const nextLanguage = targetLanguage ?? language;
    const normalizedText = text.trim();

    if (!normalizedText || nextLanguage === "en") {
      return text;
    }

    const cacheKey = `${nextLanguage}:${normalizedText}`;
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const result = await translateApi.translate(normalizedText, nextLanguage);
      cacheRef.current.set(cacheKey, result.translated_text);
      return result.translated_text;
    } catch {
      return text;
    }
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      isUpdatingLanguage,
      setLanguage,
      t: (key, params) => translateStatic(key, language, params),
      translateText,
    }),
    [isUpdatingLanguage, language, setLanguage, translateText],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
