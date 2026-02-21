"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useUserStore } from "@/stores/user-store";
import { useHydration } from "@/hooks/use-hydration";
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  ArrowRight,
  ListChecks,
} from "lucide-react";

export default function ExamLobbyPage() {
  const t = useTranslations("examPage");
  const hydrated = useHydration();
  const { examHistory } = useUserStore();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ClipboardCheck size={32} />
        </div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-text-secondary">{t("subtitle")}</p>
      </div>

      {/* Rules */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 font-semibold">{t("rules")}</h2>
        <ul className="space-y-3">
          {(["rule1", "rule2", "rule3", "rule4"] as const).map((rule) => (
            <li key={rule} className="flex items-start gap-3 text-sm">
              <ListChecks
                size={18}
                className="mt-0.5 shrink-0 text-primary"
              />
              <span>{t(rule)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Start button */}
      <div className="text-center">
        <Link
          href="/exam/active"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary-dark hover:shadow-xl"
        >
          {t("startExam")}
          <ArrowRight size={18} className="rtl:rotate-180" />
        </Link>
      </div>

      {/* Past results */}
      {hydrated && examHistory.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 font-semibold">{t("pastResults")}</h2>
          <div className="space-y-3">
            {examHistory.slice(0, 5).map((attempt) => (
              <Link
                key={attempt.id}
                href={`/exam/results/${attempt.id}`}
                className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-surface-secondary"
              >
                <div className="flex items-center gap-3">
                  {attempt.passed ? (
                    <CheckCircle size={20} className="text-success" />
                  ) : (
                    <XCircle size={20} className="text-danger" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {attempt.score}/30 -{" "}
                      <span
                        className={
                          attempt.passed ? "text-success" : "text-danger"
                        }
                      >
                        {attempt.passed ? t("passed") : t("failed")}
                      </span>
                    </p>
                    <p className="text-xs text-text-muted">
                      {new Date(attempt.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  className="text-text-muted rtl:rotate-180"
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
