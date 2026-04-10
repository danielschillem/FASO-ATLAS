"use client";

import { NextIntlClientProvider } from "next-intl";
import { ReactNode, useState, useEffect } from "react";
import { defaultLocale, type Locale } from "@/i18n";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [messages, setMessages] = useState<Record<string, unknown> | null>(
    null,
  );

  useEffect(() => {
    const saved = localStorage.getItem("faso-trip-locale") as Locale | null;
    if (saved && ["fr", "en", "mr"].includes(saved)) {
      setLocale(saved);
    }
  }, []);

  useEffect(() => {
    import(`@/messages/${locale}.json`).then((mod) => {
      setMessages(mod.default);
      document.documentElement.lang = locale === "mr" ? "mos" : locale;
    });
  }, [locale]);

  useEffect(() => {
    const handler = (e: CustomEvent<Locale>) => {
      const newLocale = e.detail;
      setLocale(newLocale);
      localStorage.setItem("faso-trip-locale", newLocale);
    };
    window.addEventListener("locale-change", handler as EventListener);
    return () =>
      window.removeEventListener("locale-change", handler as EventListener);
  }, []);

  if (!messages) return null;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
