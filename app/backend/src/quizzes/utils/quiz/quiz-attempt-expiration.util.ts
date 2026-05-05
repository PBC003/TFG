import { QuizAttemptStatus } from '../../enums/quiz-attempt-status.enum';
import type { QuizAttemptDocument } from '../../schemas/quiz-attempt.schema';

export async function synchronizeExpiredQuizAttempts(
  attempts: QuizAttemptDocument[],
  now: Date = new Date(),
): Promise<void> {
  const updates: Promise<QuizAttemptDocument>[] = [];

  for (const attempt of attempts) {
    if (
      attempt.status !== QuizAttemptStatus.IN_PROGRESS ||
      !attempt.expiresAt ||
      attempt.expiresAt.getTime() > now.getTime()
    ) {
      continue;
    }

    attempt.status = QuizAttemptStatus.EXPIRED;
    attempt.submittedAt = attempt.expiresAt;
    attempt.answers = [];
    attempt.earnedPoints = 0;
    updates.push(attempt.save());
  }

  if (updates.length > 0) {
    await Promise.all(updates);
  }
}
