"use client";

import { useState } from "react";
import { Check, Globe, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import {
  getLanguageLabel,
  SUPPORTED_LANGUAGE_OPTIONS,
  type LanguageCode,
} from "@/lib/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, isUpdatingLanguage, setLanguage, t } = useLanguage();
  const [error, setError] = useState("");

  async function handleSelect(nextLanguage: LanguageCode) {
    setError("");
    try {
      await setLanguage(nextLanguage);
    } catch (selectionError) {
      setError(selectionError instanceof Error ? selectionError.message : t("common.errorPrefix"));
    }
  }

  return (
    <div className="space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] text-sm text-[var(--text-primary)] transition hover:border-[var(--accent)]/25 hover:bg-[var(--accent-subtle)] ${
              compact ? "px-3 py-2" : "w-full justify-between px-3 py-2.5"
            }`}
            aria-label={t("language.switch")}
            disabled={isUpdatingLanguage}
          >
            <span className="flex items-center gap-2">
              {isUpdatingLanguage ? (
                <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
              ) : (
                <Globe className="h-4 w-4 text-[var(--accent)]" />
              )}
              {!compact ? <span>{t("language.label")}</span> : null}
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
              {compact ? language.toUpperCase() : getLanguageLabel(language)}
            </span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align={compact ? "end" : "start"}
          className="w-56 border-white/10 bg-[#0e0e0e]/95 text-[var(--text-primary)] backdrop-blur-xl"
        >
          <DropdownMenuLabel>{t("language.switch")}</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/8" />
          {SUPPORTED_LANGUAGE_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.code}
              onSelect={() => handleSelect(option.code)}
              className="cursor-pointer rounded-lg"
            >
              <div className="flex w-full items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className="text-xs text-[var(--text-muted)]">{option.code.toUpperCase()}</p>
                </div>
                {language === option.code ? (
                  <Check className="h-4 w-4 text-[var(--accent)]" />
                ) : null}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {error && !compact ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
