import type { QuizDocument } from '../../schemas/quiz.schema';
import type { PublicQuizCatalogItem } from '../../types/quiz.types';

export function toPublicQuizCatalogItem(
  quiz: QuizDocument,
  teacherName: string,
  attemptsRemaining: number | null,
  nowMs: number,
): PublicQuizCatalogItem {
  const totalQuestions = quiz.questions.reduce(
    (sum, question) => sum + Number(question.quantity ?? 1),
    0,
  );
  const totalPoints = quiz.questions.reduce(
    (sum, question) =>
      sum + Number(question.points) * Number(question.quantity ?? 1),
    0,
  );
  const isAvailableNow =
    (!quiz.startAt || quiz.startAt.getTime() <= nowMs) &&
    (!quiz.endAt || quiz.endAt.getTime() >= nowMs);

  return {
    quizId: quiz.quizId,
    title: quiz.title,
    description: quiz.description,
    teacherName,
    requiresAccessCode: quiz.requiresAccessCode === true,
    attemptsAllowed: quiz.attemptsAllowed,
    attemptsRemaining,
    totalQuestions,
    totalPoints,
    startAt: quiz.startAt,
    endAt: quiz.endAt,
    timeLimitMinutes: quiz.timeLimitMinutes,
    publishedAt: quiz.publishedAt,
    audienceScope: (quiz.assignedGroupIds?.length ?? 0) > 0 ? 'groups' : 'all',
    isAvailableNow,
    canStart:
      isAvailableNow && (attemptsRemaining === null || attemptsRemaining > 0),
  };
}
