import type { QuizDocument } from '../../schemas/quiz.schema';

export function getQuizSubmissionVisibility(
  quiz: QuizDocument,
  attemptsRemaining: number,
  nowMs = Date.now(),
) {
  const revealBlockedByEndDate =
    quiz.revealAnswersAfterClose &&
    quiz.endAt !== null &&
    quiz.endAt.getTime() > nowMs;

  return {
    revealBlockedByEndDate,
    canRevealFeedback: attemptsRemaining === 0 && !revealBlockedByEndDate,
  };
}
