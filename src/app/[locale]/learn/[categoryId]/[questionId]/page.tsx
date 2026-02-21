"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useHydration } from "@/hooks/use-hydration";
import {
  getQuestionById,
  getQuestionsByCategory,
} from "@/lib/questions";
import { useUserStore } from "@/stores/user-store";
import type { Locale, CategoryId, OptionKey } from "@/types/question";
import {
  ArrowLeft,
  ArrowRight,
  Star,
  Eye,
  EyeOff,
  Check,
  X,
  CheckCircle,
} from "lucide-react";

export default function QuestionPage() {
  const t = useTranslations("category");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const params = useParams();
  const categoryId = params.categoryId as CategoryId;
  const questionId = Number(params.questionId);

  const question = getQuestionById(questionId);
  const categoryQuestions = getQuestionsByCategory(categoryId);
  const currentIndex = categoryQuestions.findIndex((q) => q.id === questionId);

  const {
    toggleBookmark,
    isBookmarked,
    markQuestionLearned,
    isQuestionLearned,
  } = useUserStore();

  const hydrated = useHydration();
  const [selectedAnswer, setSelectedAnswer] = useState<OptionKey | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  if (!question) {
    return <div>Question not found</div>;
  }

  const bookmarked = hydrated && isBookmarked(questionId);
  const learned = hydrated && isQuestionLearned(questionId);
  const prevQuestion = currentIndex > 0 ? categoryQuestions[currentIndex - 1] : null;
  const nextQuestion =
    currentIndex < categoryQuestions.length - 1
      ? categoryQuestions[currentIndex + 1]
      : null;

  function handleShowAnswer() {
    setShowAnswer(true);
    markQuestionLearned(questionId);
  }

  function handleSelectAnswer(key: OptionKey) {
    if (!showAnswer) {
      setSelectedAnswer(key);
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/learn/${categoryId}`}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft size={16} className="rtl:rotate-180" />
          {tc("back")}
        </Link>
        <span className="text-sm text-text-muted">
          {t("questionOf", {
            current: currentIndex + 1,
            total: categoryQuestions.length,
          })}
        </span>
      </div>

      {/* Question card */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        {/* Question text */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {tc("question")} {question.id}
            </span>
            {learned && (
              <span className="rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success">
                <Check size={14} className="inline" /> {tc("correct")}
              </span>
            )}
          </div>

          <h2 className="text-lg font-semibold leading-relaxed text-left" dir="ltr">
            {question.question.de}
          </h2>

          {/* Translation */}
          {showTranslation && (question.question[locale] || question.question.fa) && (
            <p className="mt-3 rounded-lg bg-surface-secondary p-3 text-text-secondary leading-relaxed"
              dir={(question.question[locale] ? locale : "fa") === "fa" ? "rtl" : "ltr"}
            >
              {question.question[locale] || question.question.fa}
            </p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option.key;
            const isCorrect = option.key === question.correctAnswer;

            let optionClass =
              "flex w-full cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all";

            if (showAnswer) {
              if (isCorrect) {
                optionClass +=
                  " border-success bg-success/5 text-success";
              } else if (isSelected && !isCorrect) {
                optionClass +=
                  " border-danger bg-danger/5 text-danger";
              } else {
                optionClass += " border-border opacity-50";
              }
            } else if (isSelected) {
              optionClass +=
                " border-primary bg-primary/5";
            } else {
              optionClass +=
                " border-border hover:border-primary/50 hover:bg-primary/5";
            }

            return (
              <button
                key={option.key}
                onClick={() => handleSelectAnswer(option.key)}
                className={optionClass}
                disabled={showAnswer}
                dir="ltr"
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-medium ${
                    showAnswer && isCorrect
                      ? "border-success bg-success text-white"
                      : showAnswer && isSelected && !isCorrect
                      ? "border-danger bg-danger text-white"
                      : isSelected
                      ? "border-primary bg-primary text-white"
                      : "border-border"
                  }`}
                >
                  {showAnswer && isCorrect ? (
                    <Check size={14} />
                  ) : showAnswer && isSelected && !isCorrect ? (
                    <X size={14} />
                  ) : (
                    option.key
                  )}
                </span>
                <div className="flex-1 text-start">
                  <p className="leading-relaxed text-left" dir="ltr">
                    {option.de}
                  </p>
                  {showTranslation && (option[locale] || option.fa) && (
                    <p
                      className="mt-1 text-sm text-text-muted"
                      dir={(option[locale] ? locale : "fa") === "fa" ? "rtl" : "ltr"}
                    >
                      {option[locale] || option.fa}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowTranslation(!showTranslation)}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-surface-secondary"
        >
          {showTranslation ? <EyeOff size={16} /> : <Eye size={16} />}
          {showTranslation ? t("hideTranslation") : t("showTranslation")}
        </button>

        {!showAnswer ? (
          <button
            onClick={handleShowAnswer}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white transition-colors hover:bg-primary-dark"
          >
            <CheckCircle size={16} />
            {t("showAnswer")}
          </button>
        ) : (
          <span className="flex items-center gap-2 rounded-lg bg-success/10 px-4 py-2 text-sm text-success text-left" dir="ltr">
            <Check size={16} />
            {question.correctAnswer}:{" "}
            {question.options.find(
              (o) => o.key === question.correctAnswer
            )?.de}
          </span>
        )}

        <button
          onClick={() => toggleBookmark(questionId)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
            bookmarked
              ? "border-warning bg-warning/10 text-warning"
              : "border-border hover:bg-surface-secondary"
          }`}
        >
          <Star size={16} className={bookmarked ? "fill-current" : ""} />
          {bookmarked ? t("removeBookmark") : t("bookmark")}
        </button>
      </div>

      {/* Prev/Next navigation */}
      <div className="flex justify-between">
        {prevQuestion ? (
          <Link
            href={`/learn/${categoryId}/${prevQuestion.id}`}
            onClick={() => {
              setShowAnswer(false);
              setSelectedAnswer(null);
            }}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-secondary"
          >
            <ArrowLeft size={16} className="rtl:rotate-180" />
            {tc("previous")}
          </Link>
        ) : (
          <div />
        )}
        {nextQuestion ? (
          <Link
            href={`/learn/${categoryId}/${nextQuestion.id}`}
            onClick={() => {
              setShowAnswer(false);
              setSelectedAnswer(null);
            }}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-secondary"
          >
            {tc("next")}
            <ArrowRight size={16} className="rtl:rotate-180" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
