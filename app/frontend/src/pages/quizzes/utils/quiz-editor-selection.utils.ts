import type {
  ParametricQuestionConfig,
  QuestionItem,
} from "../../../types/question";
import type { SelectedQuestionState } from "../components/quiz-editor/quiz-editor-dialog.types";
import { resolveParametricTolerance } from "../../../utils/parametric-question.utils";
import { normalizeForSearch } from "./quiz-editor-dialog.utils";

function getDefaultParametricTolerance(question: QuestionItem): string {
  if (question.type !== "parametric") {
    return "";
  }

  const config = question.questionConfig as ParametricQuestionConfig;
  return String(resolveParametricTolerance(config));
}

export function buildSelectedQuestionMap(
  selectedQuestions: SelectedQuestionState[],
) {
  return new Map(
    selectedQuestions.map((question) => [question.questionId, question]),
  );
}

export function countSelectedQuizQuestionSlots(
  selectedQuestions: SelectedQuestionState[],
) {
  return selectedQuestions.reduce(
    (sum, question) =>
      sum + (question.type === "parametric" ? (question.quantity ?? 1) : 1),
    0,
  );
}

export function orderQuizEditorQuestions(
  questionBank: QuestionItem[],
  search: string,
  selectedQuestionMap: Map<string, SelectedQuestionState>,
) {
  const normalizedSearch = normalizeForSearch(search.trim());

  return questionBank
    .filter((question) => {
      if (!normalizedSearch) {
        return true;
      }

      return normalizeForSearch(
        [
          question.title,
          question.statement,
          question.questionId,
          ...question.tags,
        ].join(" "),
      ).includes(normalizedSearch);
    })
    .sort((left, right) => {
      const leftSelected = selectedQuestionMap.has(left.questionId) ? 0 : 1;
      const rightSelected = selectedQuestionMap.has(right.questionId) ? 0 : 1;

      if (leftSelected !== rightSelected) {
        return leftSelected - rightSelected;
      }

      return left.title.localeCompare(right.title, undefined, {
        sensitivity: "base",
      });
    });
}

export function paginateQuizEditorQuestions<T>(
  questions: T[],
  page: number,
  rowsPerPage: number,
) {
  const startIndex = page * rowsPerPage;
  return questions.slice(startIndex, startIndex + rowsPerPage);
}

export function toggleQuizEditorQuestionSelection(
  current: SelectedQuestionState[],
  questionOrId: QuestionItem | string,
): SelectedQuestionState[] {
  const questionId =
    typeof questionOrId === "string" ? questionOrId : questionOrId.questionId;
  const existingQuestion = current.find(
    (candidate) => candidate.questionId === questionId,
  );

  if (existingQuestion) {
    return current.filter((candidate) => candidate.questionId !== questionId);
  }

  if (typeof questionOrId === "string") {
    return [
      ...current,
      {
        questionId,
        points: 1,
      },
    ];
  }

  return [
    ...current,
    {
      questionId: questionOrId.questionId,
      type: questionOrId.type,
      points: 1,
      quantity: 1,
      toleranceOverride:
        questionOrId.type === "parametric"
          ? getDefaultParametricTolerance(questionOrId)
          : "",
    },
  ];
}

export function updateQuizEditorQuestionPoints(
  current: SelectedQuestionState[],
  questionId: string,
  nextValue: string,
): SelectedQuestionState[] {
  const numericValue = Number.parseInt(nextValue, 10);

  return current.map((question) =>
    question.questionId === questionId
      ? {
          ...question,
          points: Number.isNaN(numericValue) ? 0 : Math.max(0, numericValue),
        }
      : question,
  );
}

export function updateQuizEditorQuestionQuantity(
  current: SelectedQuestionState[],
  questionId: string,
  nextValue: string,
): SelectedQuestionState[] {
  const numericValue = Number.parseInt(nextValue, 10);

  return current.map((question) =>
    question.questionId === questionId
      ? {
          ...question,
          quantity: Number.isNaN(numericValue) ? 0 : Math.max(0, numericValue),
        }
      : question,
  );
}

export function updateQuizEditorQuestionToleranceOverride(
  current: SelectedQuestionState[],
  questionId: string,
  nextValue: string,
): SelectedQuestionState[] {
  return current.map((question) =>
    question.questionId === questionId
      ? {
          ...question,
          toleranceOverride: nextValue,
        }
      : question,
  );
}

export function hasUnsupportedQuizEditorQuestionType() {
  return false;
}
