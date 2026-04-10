import type { QuizItem } from "../../../types/quiz";

export function filterQuizzes(
  quizzes: QuizItem[],
  search: string,
  statusFilter: "all" | "draft" | "published",
) {
  const normalizedSearch = search.trim().toLowerCase();

  return quizzes.filter((quiz) => {
    const matchesStatus =
      statusFilter === "all" || quiz.status === statusFilter;
    if (!matchesStatus) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return (
      quiz.title.toLowerCase().includes(normalizedSearch) ||
      (quiz.description ?? "").toLowerCase().includes(normalizedSearch) ||
      (quiz.accessCode ?? "").toLowerCase().includes(normalizedSearch) ||
      quiz.status.toLowerCase().includes(normalizedSearch)
    );
  });
}

export function buildQuizAccessUrl(quizId: string) {
  return `${window.location.origin}/quiz-access/${quizId}`;
}

export function replaceQuizItem(current: QuizItem[], nextQuiz: QuizItem) {
  return current.map((quiz) =>
    quiz.quizId === nextQuiz.quizId ? nextQuiz : quiz,
  );
}

export function prependQuizItem(current: QuizItem[], nextQuiz: QuizItem) {
  return [nextQuiz, ...current];
}

export function removeQuizItem(current: QuizItem[], quizId: string) {
  return current.filter((candidate) => candidate.quizId !== quizId);
}

export function paginateItems<T>(
  items: T[],
  page: number,
  rowsPerPage: number,
) {
  const startIndex = page * rowsPerPage;
  return items.slice(startIndex, startIndex + rowsPerPage);
}
