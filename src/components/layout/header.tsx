"use client";

import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import type { Locale } from "@/types/question";
import { localeNames } from "@/i18n/config";
import {
  BookOpen,
  ClipboardCheck,
  Star,
  History,
  Home,
  Globe,
} from "lucide-react";

export function Header() {
  const t = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale() as Locale;

  function switchLocale(newLocale: string) {
    router.replace(
      { pathname },
      { locale: newLocale as Locale }
    );
  }

  const navItems = [
    { href: "/" as const, label: t("home"), icon: Home },
    { href: "/learn" as const, label: t("learn"), icon: BookOpen },
    { href: "/exam" as const, label: t("exam"), icon: ClipboardCheck },
    { href: "/bookmarks" as const, label: t("bookmarks"), icon: Star },
    { href: "/history" as const, label: t("history"), icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-primary">
          {t("appName")}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={currentLocale}
              onChange={(e) => switchLocale(e.target.value)}
              className="appearance-none rounded-lg border border-border bg-surface py-1.5 pe-8 ps-3 text-sm outline-none focus:border-primary"
            >
              {(Object.entries(localeNames) as [Locale, string][]).map(
                ([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                )
              )}
            </select>
            <Globe
              size={14}
              className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-text-muted"
            />
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <nav className="flex border-t border-border md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
                isActive
                  ? "font-medium text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
