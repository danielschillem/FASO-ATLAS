"use client";

import { useState, useRef, useEffect } from "react";
import { localeNames, type Locale } from "@/i18n";

const FLAGS: Record<Locale, React.ReactNode> = {
  fr: (
    <span className="inline-flex rounded overflow-hidden w-5 h-3.5 border border-white/20">
      <span className="flex-1 bg-[#002395]" />
      <span className="flex-1 bg-blanc" />
      <span className="flex-1 bg-[#ED2939]" />
    </span>
  ),
  en: (
    <span className="inline-block w-5 h-3.5 rounded bg-[#012169] border border-white/20 text-center leading-[0.85rem] text-[6px] font-bold text-white">
      EN
    </span>
  ),
  mr: (
    <span className="inline-flex rounded overflow-hidden w-5 h-3.5 border border-white/20">
      <span className="flex-1 bg-rouge" />
      <span className="flex-1 bg-vert" />
    </span>
  ),
};

export function LocaleSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Locale>("fr");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("faso-trip-locale") as Locale | null;
    if (saved && ["fr", "en", "mr"].includes(saved)) {
      setCurrent(saved);
    }
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const switchLocale = (locale: Locale) => {
    setCurrent(locale);
    setOpen(false);
    window.dispatchEvent(new CustomEvent("locale-change", { detail: locale }));
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-sable-2 hover:text-blanc transition-colors rounded hover:bg-white/5"
        aria-label={`Langue : ${localeNames[current]}`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span aria-hidden="true">{FLAGS[current]}</span>
        <span className="hidden sm:inline text-xs">
          {current.toUpperCase()}
        </span>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 bg-nuit border border-white/10 rounded shadow-faso py-1 min-w-[140px] z-50"
          role="listbox"
          aria-label="Sélectionner la langue"
        >
          {(Object.entries(localeNames) as [Locale, string][]).map(
            ([code, name]) => (
              <button
                key={code}
                onClick={() => switchLocale(code)}
                className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                  current === code
                    ? "text-or bg-white/5"
                    : "text-sable-2 hover:text-blanc hover:bg-white/5"
                }`}
                role="option"
                aria-selected={current === code}
              >
                <span aria-hidden="true">{FLAGS[code]}</span>
                {name}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
