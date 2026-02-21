"use client";

import { useState, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { generateExamQuestions, calculateScore, PASS_THRESHOLD } from "@/lib/exam-generator";
import { useUserStore } from "@/stores/user-store";
import type { Question, OptionKey, ExamAttempt } from "@/types/question";

interface ExamState {
  questions: Question[];
  currentIndex: number;
  answers: Record<number, OptionKey | null>;
  isActive: boolean;
  startTime: number;
}

export function useExam() {
  const [state, setState] = useState<ExamState>({
    questions: [],
    currentIndex: 0,
    answers: {},
    isActive: false,
    startTime: 0,
  });
  const { addExamAttempt } = useUserStore();
  const stateRef = useRef(state);
  stateRef.current = state;

  const startExam = useCallback(() => {
    const questions = generateExamQuestions();
    const answers: Record<number, OptionKey | null> = {};
    questions.forEach((q) => {
      answers[q.id] = null;
    });
    setState({
      questions,
      currentIndex: 0,
      answers,
      isActive: true,
      startTime: Date.now(),
    });
  }, []);

  const setAnswer = useCallback((questionId: number, answer: OptionKey) => {
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer },
    }));
  }, []);

  const goToQuestion = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      currentIndex: Math.max(0, Math.min(index, prev.questions.length - 1)),
    }));
  }, []);

  const nextQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: Math.min(prev.currentIndex + 1, prev.questions.length - 1),
    }));
  }, []);

  const prevQuestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: Math.max(prev.currentIndex - 1, 0),
    }));
  }, []);

  const submitExam = useCallback((): ExamAttempt => {
    const s = stateRef.current;
    const score = calculateScore(s.questions, s.answers);
    const durationSeconds = Math.floor((Date.now() - s.startTime) / 1000);

    const attempt: ExamAttempt = {
      id: uuidv4(),
      timestamp: Date.now(),
      questionIds: s.questions.map((q) => q.id),
      answers: s.answers,
      score,
      passed: score >= PASS_THRESHOLD,
      durationSeconds,
    };

    addExamAttempt(attempt);

    setState((prev) => ({
      ...prev,
      isActive: false,
    }));

    return attempt;
  }, [addExamAttempt]);

  const answeredCount = Object.values(state.answers).filter(
    (a) => a !== null
  ).length;
  const unansweredCount = state.questions.length - answeredCount;
  const currentQuestion = state.questions[state.currentIndex];

  return {
    ...state,
    currentQuestion,
    answeredCount,
    unansweredCount,
    startExam,
    setAnswer,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    submitExam,
  };
}
