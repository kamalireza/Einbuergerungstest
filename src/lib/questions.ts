import questionsData from "@/data/questions.json";
import categoriesData from "@/data/categories.json";
import type { Question, Category, CategoryId, Locale } from "@/types/question";

const questions: Question[] = questionsData as Question[];
const categories: Category[] = categoriesData as Category[];

export function getAllQuestions(): Question[] {
  return questions;
}

export function getQuestionById(id: number): Question | undefined {
  return questions.find((q) => q.id === id);
}

export function getQuestionsByCategory(categoryId: CategoryId): Question[] {
  return questions.filter((q) => q.category === categoryId);
}

export function getQuestionsBySubcategory(subcategoryId: string): Question[] {
  return questions.filter((q) => q.subcategory === subcategoryId);
}

export function getAllCategories(): Category[] {
  return categories;
}

export function getCategoryById(id: CategoryId): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getQuestionText(question: Question, locale: Locale): string {
  return question.question[locale] || question.question.de;
}

export function getOptionText(
  option: Question["options"][0],
  locale: Locale
): string {
  return option[locale] || option.de;
}

export function getCategoryName(category: Category, locale: Locale): string {
  return category.name[locale] || category.name.de;
}

export function getTotalQuestionCount(): number {
  return questions.length;
}
