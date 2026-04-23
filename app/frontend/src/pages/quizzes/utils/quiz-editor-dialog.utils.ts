import type { QuizItem } from "../../../types/quiz";
import type { QuizEditorInitialState } from "../components/quiz-editor/quiz-editor-dialog.types";

export const QUESTION_ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

export function toLocalDateTimeValue(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function toIsoDateTimeValue(value: string): string | null {
  if (!value.trim()) {
    return null;
  }

  return new Date(value).toISOString();
}

export function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\\{}_^$]/g, " ")
    .toLowerCase();
}

export function getInitialQuizEditorState(
  quiz: QuizItem | null,
): QuizEditorInitialState {
  return {
    quizTitle: quiz?.title ?? "",
    quizDescription: quiz?.description ?? "",
    accessCode: quiz?.requiresAccessCode ? (quiz.accessCode ?? "") : "",
    attemptsAllowed: String(quiz?.attemptsAllowed ?? 1),
    startAt: toLocalDateTimeValue(quiz?.startAt ?? null),
    endAt: toLocalDateTimeValue(quiz?.endAt ?? null),
    timeLimitMinutes: quiz?.timeLimitMinutes
      ? String(quiz.timeLimitMinutes)
      : "",
    shuffleQuestions: quiz?.shuffleQuestions ?? false,
    revealAnswersAfterClose: quiz?.revealAnswersAfterClose ?? false,
    selectedQuestions: (quiz?.questions ?? []).map((question) => ({
      questionId: question.questionId,
      type: question.type,
      points: question.points,
      quantity: question.quantity ?? 1,
      toleranceOverride:
        question.toleranceOverride === undefined ||
        question.toleranceOverride === null
          ? ""
          : String(question.toleranceOverride),
    })),
    selectedGroupIds: [...(quiz?.assignedGroupIds ?? [])],
  };
}
