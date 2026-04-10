import type { QuestionItem } from "../../../types/question";
import type { SelectedQuestionState } from "../components/quiz-editor/quiz-editor-dialog.types";
import { normalizeForSearch } from "./quiz-editor-dialog.utils";

const UNSUPPORTED_QUIZ_TYPES = new Set(["parametric"]);

export function buildSelectedQuestionMap(
  selectedQuestions: SelectedQuestionState[],
) {
  return new Map(
    selectedQuestions.map((question) => [question.questionId, question]),
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
  questionId: string,
): SelectedQuestionState[] {
  const existingQuestion = current.find(
    (candidate) => candidate.questionId === questionId,
  );

  if (existingQuestion) {
    return current.filter((candidate) => candidate.questionId !== questionId);
  }

  return [...current, { questionId, points: 1 }];
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

export function hasUnsupportedQuizEditorQuestionType(
  selectedQuestions: SelectedQuestionState[],
  questionBank: QuestionItem[],
) {
  return selectedQuestions.some((selectedQuestion) => {
    const question = questionBank.find(
      (candidate) => candidate.questionId === selectedQuestion.questionId,
    );

    return question ? UNSUPPORTED_QUIZ_TYPES.has(question.type) : false;
  });
}
