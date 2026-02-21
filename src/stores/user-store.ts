"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExamAttempt, Locale } from "@/types/question";

interface UserStore {
  bookmarks: number[];
  examHistory: ExamAttempt[];
  learnProgress: Record<number, boolean>;
  locale: Locale;

  toggleBookmark: (questionId: number) => void;
  isBookmarked: (questionId: number) => boolean;
  addExamAttempt: (attempt: ExamAttempt) => void;
  getExamAttempt: (id: string) => ExamAttempt | undefined;
  markQuestionLearned: (questionId: number) => void;
  isQuestionLearned: (questionId: number) => boolean;
  getLearnedCount: (questionIds: number[]) => number;
  setLocale: (locale: Locale) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      examHistory: [],
      learnProgress: {},
      locale: "fa",

      toggleBookmark: (questionId: number) =>
        set((state) => ({
          bookmarks: state.bookmarks.includes(questionId)
            ? state.bookmarks.filter((id) => id !== questionId)
            : [...state.bookmarks, questionId],
        })),

      isBookmarked: (questionId: number) =>
        get().bookmarks.includes(questionId),

      addExamAttempt: (attempt: ExamAttempt) =>
        set((state) => ({
          examHistory: [attempt, ...state.examHistory],
        })),

      getExamAttempt: (id: string) =>
        get().examHistory.find((a) => a.id === id),

      markQuestionLearned: (questionId: number) =>
        set((state) => ({
          learnProgress: { ...state.learnProgress, [questionId]: true },
        })),

      isQuestionLearned: (questionId: number) =>
        !!get().learnProgress[questionId],

      getLearnedCount: (questionIds: number[]) => {
        const progress = get().learnProgress;
        return questionIds.filter((id) => progress[id]).length;
      },

      setLocale: (locale: Locale) => set({ locale }),
    }),
    {
      name: "citizenship-user-store",
    }
  )
);
