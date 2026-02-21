"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useUserStore } from "@/stores/user-store";
import { useHydration } from "@/hooks/use-hydration";
import {
  CheckCircle,
  XCircle,
  Clock,
  ClipboardCheck,
  ArrowRight,
} from "lucide-react";

export default function HistoryPage() {
  const t = useTranslations("historyPage");
  const te = useTranslations("examPage");
  const hydrated = useHydration();
  const { examHistory } = useUserStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-text-secondary">{t("subtitle")}</p>
      </div>

      {!hydrated ? (
        <div className="py-16 text-center text-text-muted">Loading...</div>
      ) : examHistory.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <Clock size={48} className="mx-auto mb-4 text-text-muted" />
          <p className="font-medium text-text-secondary">
            {t("noHistory")}
          </p>
          <Link
            href="/exam"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white"
          >
            <ClipboardCheck size={16} />
            {te("startExam")}
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          {/* Header - desktop */}
          <div className="hidden border-b border-border bg-surface-secondary px-4 py-3 text-sm font-medium text-text-secondary md:grid md:grid-cols-5">
            <span>{t("date")}</span>
            <span>{t("score")}</span>
            <span>{t("status")}</span>
            <span>{t("duration")}</span>
            <span>{t("details")}</span>
          </div>

          {/* Rows */}
          {examHistory.map((attempt) => {
            const minutes = Math.floor(attempt.durationSeconds / 60);
            const seconds = attempt.durationSeconds % 60;

            return (
              <Link
                key={attempt.id}
                href={`/exam/results/${attempt.id}`}
                className="flex items-center justify-between border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-surface-secondary md:grid md:grid-cols-5"
              >
                <span className="text-sm">
                  {new Date(attempt.timestamp).toLocaleDateString()}{" "}
                  <span className="text-text-muted">
                    {new Date(attempt.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </span>
                <span className="text-sm font-semibold">
                  {attempt.score}/30
                </span>
                <span className="flex items-center gap-1.5 text-sm">
                  {attempt.passed ? (
                    <>
                      <CheckCircle size={16} className="text-success" />
                      <span className="text-success">{te("passed")}</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={16} className="text-danger" />
                      <span className="text-danger">{te("failed")}</span>
                    </>
                  )}
                </span>
                <span className="text-sm text-text-muted">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </span>
                <span className="md:hidden">
                  <ArrowRight
                    size={16}
                    className="text-text-muted rtl:rotate-180"
                  />
                </span>
                <span className="hidden text-sm text-primary md:block">
                  {t("details")} →
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
