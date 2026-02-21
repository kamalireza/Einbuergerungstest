"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useUserStore } from "@/stores/user-store";
import { useHydration } from "@/hooks/use-hydration";
import { getQuestionById } from "@/lib/questions";
import type { OptionKey } from "@/types/question";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  RotateCcw,
  Check,
  X,
  Trophy,
} from "lucide-react";

export default function ResultsPage() {
  const t = useTranslations("results");
  const tc = useTranslations("common");
  const te = useTranslations("examPage");
  const params = useParams();
  const attemptId = params.attemptId as string;
  const hydrated = useHydration();
  const { getExamAttempt } = useUserStore();

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-text-secondary">Loading results...</p>
        </div>
      </div>
    );
  }

  const attempt = getExamAttempt(attemptId);

  if (!attempt) {
    return (
      <div className="py-20 text-center">
        <p className="text-text-secondary">Exam not found</p>
        <Link href="/exam" className="mt-4 text-primary underline">
          {t("backToExam")}
        </Link>
      </div>
    );
  }

  const questions = attempt.questionIds
    .map((id) => getQuestionById(id))
    .filter(Boolean);

  const minutes = Math.floor(attempt.durationSeconds / 60);
  const seconds = attempt.durationSeconds % 60;

  return (
    <div className="space-y-8">
      {/* Score card */}
      <div
        className={`rounded-xl border-2 p-8 text-center ${
          attempt.passed
            ? "border-success bg-success/5"
            : "border-danger bg-danger/5"
        }`}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface">
          {attempt.passed ? (
            <Trophy size={32} className="text-success" />
          ) : (
            <XCircle size={32} className="text-danger" />
          )}
        </div>
        <h1
          className={`text-2xl font-bold ${
            attempt.passed ? "text-success" : "text-danger"
          }`}
        >
          {attempt.passed ? t("passed") : t("failed")}
        </h1>
        <p className="mt-2 text-3xl font-bold">
          {t("score", { score: attempt.score, total: 30 })}
        </p>
        <p className="mt-2 text-text-secondary">
          {attempt.passed ? t("passMessage") : t("failMessage")}
        </p>
        <p className="mt-1 text-sm text-text-muted">
          {minutes}:{seconds.toString().padStart(2, "0")} min
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Link
          href="/exam/active"
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          <RotateCcw size={16} />
          {t("tryAgain")}
        </Link>
        <Link
          href="/exam"
          className="flex items-center gap-2 rounded-lg border border-border px-6 py-2.5 text-sm transition-colors hover:bg-surface-secondary"
        >
          <ArrowLeft size={16} className="rtl:rotate-180" />
          {t("backToExam")}
        </Link>
      </div>

      {/* Answer review */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t("reviewAnswers")}</h2>

        {questions.map((question, idx) => {
          if (!question) return null;
          const userAnswer = attempt.answers[question.id] as OptionKey | null;
          const isCorrect = userAnswer === question.correctAnswer;

          return (
            <div
              key={question.id}
              className={`rounded-xl border p-5 ${
                isCorrect
                  ? "border-success/30 bg-success/5"
                  : "border-danger/30 bg-danger/5"
              }`}
            >
              <div className="mb-3 flex items-start gap-3">
                <span className="mt-0.5">
                  {isCorrect ? (
                    <CheckCircle size={20} className="text-success" />
                  ) : (
                    <XCircle size={20} className="text-danger" />
                  )}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-text-muted">
                    {tc("question")} {idx + 1}
                  </p>
                  <p className="font-medium leading-relaxed text-left" dir="ltr">
                    {question.question.de}
                  </p>
                </div>
              </div>

              <div className="ms-8 space-y-2">
                {question.options.map((option) => {
                  const isUserAnswer = option.key === userAnswer;
                  const isCorrectAnswer =
                    option.key === question.correctAnswer;

                  let className = "flex items-start gap-2 rounded-lg p-2 text-sm";
                  if (isCorrectAnswer) {
                    className += " bg-success/10 font-medium text-success";
                  } else if (isUserAnswer && !isCorrectAnswer) {
                    className +=
                      " bg-danger/10 line-through text-danger";
                  } else {
                    className += " text-text-muted";
                  }

                  return (
                    <div key={option.key} className={className} dir="ltr">
                      <span className="mt-0.5 shrink-0">
                        {isCorrectAnswer ? (
                          <Check size={14} />
                        ) : isUserAnswer ? (
                          <X size={14} />
                        ) : (
                          <span className="inline-block w-3.5" />
                        )}
                      </span>
                      <span className="text-left" dir="ltr">
                        {option.key}) {option.de}
                      </span>
                    </div>
                  );
                })}
              </div>

              {!isCorrect && (
                <div className="ms-8 mt-2 text-sm">
                  {userAnswer ? (
                    <p className="text-danger">
                      {t("yourAnswer")}: {userAnswer}
                    </p>
                  ) : (
                    <p className="text-text-muted italic">
                      {te("notAnswered")}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
