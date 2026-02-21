"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useExam } from "@/hooks/use-exam";
import { useHydration } from "@/hooks/use-hydration";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  AlertTriangle,
} from "lucide-react";

export default function ActiveExamPage() {
  const t = useTranslations("examPage");
  const tc = useTranslations("common");
  const router = useRouter();
  const hydrated = useHydration();
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    questions,
    currentIndex,
    currentQuestion,
    answers,
    isActive,
    answeredCount,
    unansweredCount,
    startExam,
    setAnswer,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    submitExam,
  } = useExam();

  useEffect(() => {
    if (hydrated && !isActive && questions.length === 0) {
      startExam();
    }
  }, [hydrated, isActive, questions.length, startExam]);

  function handleSubmit() {
    if (unansweredCount > 0) {
      setShowConfirm(true);
    } else {
      doSubmit();
    }
  }

  function doSubmit() {
    const attempt = submitExam();
    router.push(`/exam/results/${attempt.id}`);
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-text-secondary">Loading exam...</p>
        </div>
      </div>
    );
  }

  const selectedAnswer = answers[currentQuestion.id];

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">
            {tc("question")} {currentIndex + 1} {tc("of")} {questions.length}
          </span>
          <span className="text-text-secondary">
            {t("answered")}: {answeredCount}/{questions.length}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${(answeredCount / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {tc("question")} {currentIndex + 1}
          </span>
        </div>
        <h2 className="text-lg font-semibold leading-relaxed text-left" dir="ltr">
          {currentQuestion.question.de}
        </h2>

        <div className="mt-6 space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswer === option.key;
            return (
              <button
                key={option.key}
                onClick={() => setAnswer(currentQuestion.id, option.key)}
                dir="ltr"
                className={`flex w-full cursor-pointer items-start gap-3 rounded-lg border p-4 text-start transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-medium ${
                    isSelected
                      ? "border-primary bg-primary text-white"
                      : "border-border"
                  }`}
                >
                  {option.key}
                </span>
                <p className="flex-1 leading-relaxed text-left" dir="ltr">
                  {option.de}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevQuestion}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-surface-secondary disabled:opacity-30"
        >
          <ArrowLeft size={16} className="rtl:rotate-180" />
          {tc("previous")}
        </button>

        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 rounded-lg bg-success px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-success/90"
        >
          <Send size={16} />
          {t("submitExam")}
        </button>

        <button
          onClick={nextQuestion}
          disabled={currentIndex === questions.length - 1}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-surface-secondary disabled:opacity-30"
        >
          {tc("next")}
          <ArrowRight size={16} className="rtl:rotate-180" />
        </button>
      </div>

      {/* Question grid */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="grid grid-cols-10 gap-2">
          {questions.map((q, idx) => {
            const isAnswered = answers[q.id] !== null;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => goToQuestion(idx)}
                className={`flex h-8 w-8 items-center justify-center rounded text-xs font-medium transition-colors ${
                  isCurrent
                    ? "bg-primary text-white"
                    : isAnswered
                    ? "bg-success/20 text-success"
                    : "bg-surface-secondary text-text-muted hover:bg-border"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-surface p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <AlertTriangle size={24} className="text-warning" />
              <h3 className="text-lg font-semibold">{t("confirmSubmit")}</h3>
            </div>
            <p className="mb-6 text-text-secondary">
              {t("unanswered", { count: unansweredCount })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg border border-border py-2 text-sm transition-colors hover:bg-surface-secondary"
              >
                {tc("cancel")}
              </button>
              <button
                onClick={doSubmit}
                className="flex-1 rounded-lg bg-primary py-2 text-sm text-white transition-colors hover:bg-primary-dark"
              >
                {t("submitExam")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
