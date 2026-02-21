"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useUserStore } from "@/stores/user-store";
import { useHydration } from "@/hooks/use-hydration";
import { getTotalQuestionCount } from "@/lib/questions";
import { StatsCard } from "@/components/shared/stats-card";
import {
  BookOpen,
  ClipboardCheck,
  Star,
  Trophy,
  ArrowRight,
  GraduationCap,
  Target,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const hydrated = useHydration();
  const { bookmarks, examHistory, learnProgress } = useUserStore();

  const totalQuestions = getTotalQuestionCount();
  const learnedCount = hydrated ? Object.keys(learnProgress).length : 0;
  const examCount = hydrated ? examHistory.length : 0;
  const bestScore =
    hydrated && examHistory.length > 0
      ? Math.max(...examHistory.map((e) => e.score))
      : 0;
  const bookmarkCount = hydrated ? bookmarks.length : 0;

  return (
    <div className="space-y-10">
      {/* Hero section */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-surface to-success/5 p-8 text-center md:p-12">
        <h1 className="text-3xl font-bold md:text-4xl">{t("welcome")}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-text-secondary leading-relaxed">
          {t("heroDescription")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            {t("startLearning")}
            <ArrowRight size={16} className="rtl:rotate-180" />
          </Link>
          <Link
            href="/exam"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-6 py-2.5 text-sm font-medium transition-colors hover:bg-surface-secondary"
          >
            {t("startExam")}
            <ArrowRight size={16} className="rtl:rotate-180" />
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div>
        <h2 className="mb-6 text-center text-xl font-bold">{t("howItWorks")}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-start gap-4 rounded-xl border border-border bg-surface p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              1
            </div>
            <div>
              <h3 className="font-semibold">{t("step1Title")}</h3>
              <p className="mt-1 text-sm text-text-secondary">{t("step1Desc")}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-xl border border-border bg-surface p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10 text-lg font-bold text-success">
              2
            </div>
            <div>
              <h3 className="font-semibold">{t("step2Title")}</h3>
              <p className="mt-1 text-sm text-text-secondary">{t("step2Desc")}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-xl border border-border bg-surface p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/10 text-lg font-bold text-warning">
              3
            </div>
            <div>
              <h3 className="font-semibold">{t("step3Title")}</h3>
              <p className="mt-1 text-sm text-text-secondary">{t("step3Desc")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/learn"
          className="group flex flex-col rounded-xl border border-border bg-surface p-6 shadow-sm transition-all hover:border-primary hover:shadow-md"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <GraduationCap size={24} />
          </div>
          <h3 className="font-semibold">{t("startLearning")}</h3>
          <p className="mt-1 flex-1 text-sm text-text-secondary">
            {t("featureLearnDesc")}
          </p>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
            {totalQuestions} {tc("questions")}
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
            />
          </div>
        </Link>

        <Link
          href="/exam"
          className="group flex flex-col rounded-xl border border-border bg-surface p-6 shadow-sm transition-all hover:border-success hover:shadow-md"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
            <Target size={24} />
          </div>
          <h3 className="font-semibold">{t("startExam")}</h3>
          <p className="mt-1 flex-1 text-sm text-text-secondary">
            {t("featureExamDesc")}
          </p>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-success">
            30 {tc("questions")}
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
            />
          </div>
        </Link>

        <Link
          href="/bookmarks"
          className="group flex flex-col rounded-xl border border-border bg-surface p-6 shadow-sm transition-all hover:border-warning hover:shadow-md"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10 text-warning">
            <Star size={24} />
          </div>
          <h3 className="font-semibold">{t("viewBookmarks")}</h3>
          <p className="mt-1 flex-1 text-sm text-text-secondary">
            {t("featureBookmarkDesc")}
          </p>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-warning">
            {bookmarkCount} {tc("questions")}
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
            />
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatsCard
          title={t("totalQuestions")}
          value={totalQuestions}
          icon={BookOpen}
        />
        <StatsCard
          title={t("questionsLearned")}
          value={learnedCount}
          icon={TrendingUp}
          color="text-success"
        />
        <StatsCard
          title={t("examsTaken")}
          value={examCount}
          icon={ClipboardCheck}
          color="text-warning"
        />
        <StatsCard
          title={t("bestScore")}
          value={examCount > 0 ? `${bestScore}/30` : "-"}
          icon={Trophy}
          color="text-danger"
        />
      </div>
    </div>
  );
}
