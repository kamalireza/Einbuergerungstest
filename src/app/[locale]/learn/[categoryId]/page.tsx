"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import {
  getCategoryById,
  getQuestionsByCategory,
  getQuestionsBySubcategory,
} from "@/lib/questions";
import { useUserStore } from "@/stores/user-store";
import { useHydration } from "@/hooks/use-hydration";
import type { Locale, CategoryId } from "@/types/question";
import { useState } from "react";
import { ArrowLeft, Check, Star } from "lucide-react";

export default function CategoryPage() {
  const t = useTranslations("category");
  const tl = useTranslations("learnPage");
  const locale = useLocale() as Locale;
  const params = useParams();
  const categoryId = params.categoryId as CategoryId;
  const category = getCategoryById(categoryId);
  const hydrated = useHydration();
  const { isBookmarked, isQuestionLearned } = useUserStore();

  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(
    null
  );

  if (!category) {
    return <div>Category not found</div>;
  }

  const questions = activeSubcategory
    ? getQuestionsBySubcategory(activeSubcategory)
    : getQuestionsByCategory(categoryId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/learn"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-surface-secondary"
        >
          <ArrowLeft size={18} className="rtl:rotate-180" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">
            {category.name[locale] || category.name.de}
          </h1>
          <p className="text-sm text-text-secondary">
            {tl("questionsCount", { count: questions.length })}
          </p>
        </div>
      </div>

      {/* Subcategory tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveSubcategory(null)}
          className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
            activeSubcategory === null
              ? "bg-primary text-white"
              : "border border-border bg-surface hover:bg-surface-secondary"
          }`}
        >
          {t("allQuestions")}
        </button>
        {category.subcategories.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setActiveSubcategory(sub.id)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              activeSubcategory === sub.id
                ? "bg-primary text-white"
                : "border border-border bg-surface hover:bg-surface-secondary"
            }`}
          >
            {sub.name[locale] || sub.name.de}
          </button>
        ))}
      </div>

      {/* Question list */}
      <div className="space-y-2">
        {questions.map((question) => {
          const learned = hydrated && isQuestionLearned(question.id);
          const bookmarked = hydrated && isBookmarked(question.id);

          return (
            <Link
              key={question.id}
              href={`/learn/${categoryId}/${question.id}`}
              className="group flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition-all hover:border-primary hover:shadow-sm"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-sm font-medium text-text-secondary">
                {question.id}
              </span>
              <p className="flex-1 text-sm leading-relaxed line-clamp-2 text-left" dir="ltr">
                {question.question.de}
              </p>
              <div className="flex items-center gap-1.5">
                {bookmarked && (
                  <Star size={14} className="fill-warning text-warning" />
                )}
                {learned && <Check size={14} className="text-success" />}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
