import type { CreateQuizInput } from "../../../types/quiz";
import type {
  QuizEditorDialogProps,
  SelectedQuestionState,
} from "../components/quiz-editor/quiz-editor-dialog.types";
import { toIsoDateTimeValue } from "./quiz-editor-dialog.utils";

type QuizEditorSubmitInput = {
  quizTitle: string;
  quizDescription: string;
  accessCode: string;
  attemptsAllowed: string;
  startAt: string;
  endAt: string;
  timeLimitMinutes: string;
  shuffleQuestions: boolean;
  revealAnswersAfterClose: boolean;
  selectedQuestions: SelectedQuestionState[];
  selectedGroupIds: string[];
  hasUnsupportedSelectedQuestion: boolean;
  validationMessage: string | null;
  fields: QuizEditorDialogProps["fields"];
};

type QuizEditorValidation = {
  payload: CreateQuizInput | null;
  validationMessage: string | null;
};

export function buildQuizEditorPayload({
  quizTitle,
  quizDescription,
  accessCode,
  attemptsAllowed,
  startAt,
  endAt,
  timeLimitMinutes,
  shuffleQuestions,
  revealAnswersAfterClose,
  selectedQuestions,
  selectedGroupIds = [],
  hasUnsupportedSelectedQuestion,
  validationMessage,
  fields,
}: QuizEditorSubmitInput): QuizEditorValidation {
  const normalizedTitle = quizTitle.trim();
  const normalizedDescription = quizDescription.trim() || null;
  const normalizedAccessCode = accessCode.trim().toUpperCase();
  const requiresAccessCode = normalizedAccessCode.length > 0;
  const normalizedAttemptsAllowed = Number.parseInt(attemptsAllowed, 10);
  const normalizedTimeLimit = Number.parseInt(timeLimitMinutes, 10);
  const normalizedStartAt = toIsoDateTimeValue(startAt);
  const normalizedEndAt = toIsoDateTimeValue(endAt);
  const nowMs = Date.now();

  if (normalizedTitle.length < 3) {
    return { payload: null, validationMessage };
  }

  const hasInvalidParametricSelection = selectedQuestions.some((question) => {
    if (question.type !== "parametric") {
      return false;
    }

    const quantity = Number(question.quantity ?? 1);
    const toleranceText = question.toleranceOverride?.trim() ?? "";
    const toleranceOverride = toleranceText
      ? Number.parseFloat(toleranceText)
      : null;

    return (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      (toleranceOverride !== null &&
        (Number.isNaN(toleranceOverride) || toleranceOverride < 0))
    );
  });

  if (
    Number.isNaN(normalizedAttemptsAllowed) ||
    normalizedAttemptsAllowed < 1 ||
    selectedQuestions.length === 0 ||
    hasUnsupportedSelectedQuestion ||
    selectedQuestions.some((question) => question.points <= 0) ||
    hasInvalidParametricSelection
  ) {
    return { payload: null, validationMessage };
  }

  if (
    normalizedStartAt &&
    normalizedEndAt &&
    new Date(normalizedEndAt).getTime() <= new Date(normalizedStartAt).getTime()
  ) {
    return { payload: null, validationMessage: fields.invalidDateRange };
  }

  if (normalizedEndAt && new Date(normalizedEndAt).getTime() <= nowMs) {
    return { payload: null, validationMessage: fields.invalidEndDateInPast };
  }

  return {
    payload: {
      title: normalizedTitle,
      description: normalizedDescription,
      accessCode: requiresAccessCode ? normalizedAccessCode : null,
      requiresAccessCode,
      attemptsAllowed: normalizedAttemptsAllowed,
      startAt: normalizedStartAt,
      endAt: normalizedEndAt,
      timeLimitMinutes:
        timeLimitMinutes.trim() && !Number.isNaN(normalizedTimeLimit)
          ? normalizedTimeLimit
          : null,
      shuffleQuestions,
      revealAnswersAfterClose,
      assignedGroupIds: [...selectedGroupIds],
      questions: selectedQuestions.map((question) => {
        const toleranceText = question.toleranceOverride?.trim() ?? "";
        return {
          questionId: question.questionId,
          points: question.points,
          quantity:
            question.type === "parametric" ? (question.quantity ?? 1) : 1,
          toleranceOverride:
            question.type === "parametric" && toleranceText
              ? Number.parseFloat(toleranceText)
              : null,
        };
      }),
    },
    validationMessage: null,
  };
}
