"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useUserStore } from "@/stores/user-store";
import { useHydration } from "@/hooks/use-hydration";
import { getQuestionById } from "@/lib/questions";
import { Star, BookOpen } from "lucide-react";

export default function BookmarksPage() {
  const t = useTranslations("bookmarksPage");
  const tc = useTranslations("common");
  const hydrated = useHydration();
  const { bookmarks, toggleBookmark } = useUserStore();

  const questions = hydrated
    ? bookmarks.map((id) => getQuestionById(id)).filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-text-secondary">{t("subtitle")}</p>
      </div>

      {!hydrated ? (
        <div className="py-16 text-center text-text-muted">Loading...</div>
      ) : questions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <Star size={48} className="mx-auto mb-4 text-text-muted" />
          <p className="font-medium text-text-secondary">
            {t("noBookmarks")}
          </p>
          <p className="mt-1 text-sm text-text-muted">
            {t("noBookmarksHint")}
          </p>
          <Link
            href="/learn"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white"
          >
            <BookOpen size={16} />
            {tc("learn")}
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((question) => {
            if (!question) return null;
            return (
              <div
                key={question.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4"
              >
                <Link
                  href={`/learn/${question.category}/${question.id}`}
                  className="flex flex-1 items-center gap-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-sm font-medium text-text-secondary">
                    {question.id}
                  </span>
                  <p className="text-sm leading-relaxed line-clamp-2 text-left" dir="ltr">
                    {question.question.de}
                  </p>
                </Link>
                <button
                  onClick={() => toggleBookmark(question.id)}
                  className="shrink-0 rounded-lg p-2 text-warning transition-colors hover:bg-warning/10"
                >
                  <Star size={18} className="fill-current" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
