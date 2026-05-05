import type {
  QuizAccessAnswerMap,
  StartAttemptOptions,
} from "../types/quiz-access-page.types";
import type {
  PublicQuizCatalogItem,
  QuizAttemptItem,
  QuizSubmissionResult,
} from "../../../types/quiz";

export function normalizeStartAttemptPayload(
  options: StartAttemptOptions | undefined,
  routeQuizId: string | undefined,
  accessCode: string,
): { quizId?: string; accessCode: string } {
  return {
    quizId: options?.quizId ?? routeQuizId ?? undefined,
    accessCode:
      options?.accessCode !== undefined
        ? (options.accessCode?.trim().toUpperCase() ?? "")
        : accessCode.trim().toUpperCase(),
  };
}

export function getSelectedQuizStartDisabled(params: {
  starting: boolean;
  isAuthenticated: boolean;
  selectedQuiz: PublicQuizCatalogItem | null;
  accessCode: string;
}): boolean {
  const { starting, isAuthenticated, selectedQuiz, accessCode } = params;

  return (
    starting ||
    !isAuthenticated ||
    !selectedQuiz ||
    !selectedQuiz.isAvailableNow ||
    selectedQuiz.attemptsRemaining === 0 ||
    (selectedQuiz.requiresAccessCode && !accessCode.trim())
  );
}

export function getCanRequestBestResult(
  selectedQuiz: PublicQuizCatalogItem | null,
  isAuthenticated: boolean,
): boolean {
  return Boolean(
    selectedQuiz && isAuthenticated && selectedQuiz.attemptsRemaining === 0,
  );
}

export function shouldAutoSubmitExpiredAttempt(params: {
  activeAttempt: QuizAttemptItem | null;
  autoSubmitTriggered: boolean;
  submitting: boolean;
  result: QuizSubmissionResult | null;
  nowMs: number;
}): boolean {
  const { activeAttempt, autoSubmitTriggered, submitting, result, nowMs } =
    params;

  if (
    !activeAttempt?.expiresAt ||
    autoSubmitTriggered ||
    submitting ||
    result !== null
  ) {
    return false;
  }

  return new Date(activeAttempt.expiresAt).getTime() <= nowMs;
}

export function buildSubmitAnswersPayload(answers: QuizAccessAnswerMap) {
  return Object.entries(answers).map(([questionId, value]) => ({
    questionId,
    value,
  }));
}
