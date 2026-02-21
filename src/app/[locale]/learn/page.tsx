"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getAllCategories, getQuestionsByCategory } from "@/lib/questions";
import { useUserStore } from "@/stores/user-store";
import { useHydration } from "@/hooks/use-hydration";
import { ProgressRing } from "@/components/shared/progress-ring";
import type { Locale } from "@/types/question";
import { ArrowRight } from "lucide-react";

export default function LearnPage() {
  const t = useTranslations("learnPage");
  const locale = useLocale() as Locale;
  const hydrated = useHydration();
  const { getLearnedCount } = useUserStore();
  const categories = getAllCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-text-secondary">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => {
          const questions = getQuestionsByCategory(category.id);
          const totalCount = questions.length;
          const learnedCount = hydrated
            ? getLearnedCount(questions.map((q) => q.id))
            : 0;
          const progress =
            totalCount > 0 ? (learnedCount / totalCount) * 100 : 0;

          return (
            <Link
              key={category.id}
              href={`/learn/${category.id}`}
              className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-primary hover:shadow-md"
            >
              <ProgressRing progress={progress} size={60} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">
                  {category.name[locale] || category.name.de}
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {category.description[locale] || category.description.de}
                </p>
                <div className="mt-2 flex gap-4 text-sm text-text-muted">
                  <span>{t("questionsCount", { count: totalCount })}</span>
                  <span>{t("learned", { count: learnedCount })}</span>
                </div>
              </div>
              <ArrowRight
                size={20}
                className="text-text-muted transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
