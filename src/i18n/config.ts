import type { Locale } from "@/types/question";

export const locales: Locale[] = ["fa", "en"];
export const defaultLocale: Locale = "fa";

export const localeNames: Record<Locale, string> = {
  fa: "فارسی",
  en: "English",
};

export const rtlLocales: Locale[] = ["fa"];

export function isRtl(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}
