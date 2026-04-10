import type { TFunction } from "i18next";
import type {
  PublicAttemptQuestion,
  PublicChoiceOption,
  PublicQuizCatalogItem,
  QuizSubmissionQuestionReview,
} from "../../../types/quiz";

export const QUIZ_ROWS_PER_PAGE_OPTIONS = [5, 10, 20];

export function normalizeQuizAccessSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\\{}_^$]/g, " ")
    .toLowerCase();
}

export function filterAndSortQuizCatalog(
  quizzes: PublicQuizCatalogItem[],
  search: string,
  routeQuizId?: string,
): PublicQuizCatalogItem[] {
  const normalizedSearch = normalizeQuizAccessSearch(search.trim());
  const sortedItems = [...quizzes].sort((left, right) => {
    if (routeQuizId) {
      if (left.quizId === routeQuizId) {
        return -1;
      }

      if (right.quizId === routeQuizId) {
        return 1;
      }
    }

    return left.title.localeCompare(right.title, undefined, {
      sensitivity: "base",
    });
  });

  if (!normalizedSearch) {
    return sortedItems;
  }

  return sortedItems.filter((quiz) =>
    normalizeQuizAccessSearch(
      [quiz.title, quiz.description ?? "", quiz.teacherName, quiz.quizId].join(
        " ",
      ),
    ).includes(normalizedSearch),
  );
}

export function paginateQuizCatalog<T>(
  items: T[],
  page: number,
  rowsPerPage: number,
): T[] {
  const startIndex = page * rowsPerPage;
  return items.slice(startIndex, startIndex + rowsPerPage);
}

export function formatRemainingTime(
  expiresAt: string | null,
  nowMs: number,
  t: TFunction,
) {
  if (!expiresAt) {
    return t("quizAccess.noTimeLimit");
  }

  const remainingMs = Math.max(0, new Date(expiresAt).getTime() - nowMs);
  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return t("quizAccess.timerValue", {
    minutes,
    seconds: `${seconds}`.padStart(2, "0"),
  });
}

function getOptionLabel(
  options: PublicChoiceOption[] | null,
  optionKey: string,
): string {
  return options?.find((option) => option.key === optionKey)?.text ?? optionKey;
}

export function formatQuizReviewAnswerValue(
  review: QuizSubmissionQuestionReview,
  value: unknown,
  t: TFunction,
): string {
  if (review.type === "true_false") {
    if (value === true) {
      return t("questions.answers.true");
    }

    if (value === false) {
      return t("questions.answers.false");
    }

    return t("quizAccess.notAnswered");
  }

  if (review.type === "single_choice") {
    if (typeof value !== "string") {
      return t("quizAccess.notAnswered");
    }

    return getOptionLabel(review.availableOptions, value);
  }

  if (review.type === "multiple_choice") {
    if (!Array.isArray(value) || value.length === 0) {
      return t("quizAccess.notAnswered");
    }

    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => getOptionLabel(review.availableOptions, item))
      .join(", ");
  }

  return t("quizAccess.notAnswered");
}

export function getPublicQuestionOptions(question: PublicAttemptQuestion) {
  return "options" in question.questionConfig
    ? question.questionConfig.options
    : [];
}
