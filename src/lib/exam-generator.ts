import { getQuestionsByCategory } from "./questions";
import type { Question, CategoryId } from "@/types/question";

const EXAM_ALLOCATION: Record<CategoryId, number> = {
  politik: 19,
  geschichte: 9,
  gesellschaft: 2,
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateExamQuestions(): Question[] {
  const selected: Question[] = [];

  for (const [categoryId, count] of Object.entries(EXAM_ALLOCATION)) {
    const categoryQuestions = getQuestionsByCategory(categoryId as CategoryId);
    const shuffled = shuffleArray(categoryQuestions);
    selected.push(...shuffled.slice(0, count));
  }

  return shuffleArray(selected);
}

export function calculateScore(
  questions: Question[],
  answers: Record<number, string | null>
): number {
  return questions.filter(
    (q) => answers[q.id] === q.correctAnswer
  ).length;
}

export const PASS_THRESHOLD = 20;
export const EXAM_QUESTION_COUNT = 30;
