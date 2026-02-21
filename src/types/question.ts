export type OptionKey = "A" | "B" | "C" | "D";
export type CategoryId = "politik" | "geschichte" | "gesellschaft" | "berlin";
export type Locale = "fa" | "en";

export interface LocalizedText {
  de: string;
  fa: string;
  en: string;
}

export interface QuestionOption {
  key: OptionKey;
  de: string;
  fa: string;
  en: string;
}

export interface Question {
  id: number;
  category: CategoryId;
  subcategory: string;
  question: LocalizedText;
  options: QuestionOption[];
  correctAnswer: OptionKey;
  imageRef: string | null;
}

export interface Category {
  id: CategoryId;
  name: LocalizedText;
  description: LocalizedText;
  questionRange: [number, number];
  examAllocation: number;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: LocalizedText;
  questionRange: [number, number];
}

export interface ExamAttempt {
  id: string;
  timestamp: number;
  questionIds: number[];
  answers: Record<number, OptionKey | null>;
  score: number;
  passed: boolean;
  durationSeconds: number;
}

export interface UserState {
  bookmarks: number[];
  examHistory: ExamAttempt[];
  learnProgress: Record<number, boolean>;
  locale: Locale;
}
