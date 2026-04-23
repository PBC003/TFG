import type { QuizDocument } from '../../schemas/quiz.schema';

export type QuizNotFoundThrower = (
  code: 'quiz.not_found',
  message: string,
) => never;

export type AccessibleGroupIdsLoader = (
  participantName: string,
) => Promise<Set<string>>;

export function isQuizVisibleToParticipant(
  quiz: Pick<QuizDocument, 'assignedGroupIds'>,
  accessibleGroupIds: Set<string>,
): boolean {
  const assignedGroupIds = quiz.assignedGroupIds ?? [];

  if (assignedGroupIds.length === 0) {
    return true;
  }

  return assignedGroupIds.some((groupId) => accessibleGroupIds.has(groupId));
}

export async function assertQuizAudienceForParticipant(
  quiz: Pick<QuizDocument, 'assignedGroupIds'>,
  participantName: string,
  loadAccessibleGroupIds: AccessibleGroupIdsLoader,
  throwNotFound: QuizNotFoundThrower,
): Promise<void> {
  const assignedGroupIds = quiz.assignedGroupIds ?? [];

  if (assignedGroupIds.length === 0) {
    return;
  }

  const match = /^user:(\d+)$/.exec(participantName.trim());

  if (!match) {
    throwNotFound('quiz.not_found', 'Quiz not found');
  }

  const accessibleGroupIds = await loadAccessibleGroupIds(participantName);

  if (!isQuizVisibleToParticipant(quiz, accessibleGroupIds)) {
    throwNotFound('quiz.not_found', 'Quiz not found');
  }
}

export function buildPreviewParticipantName(userId: number): string {
  return `preview:user:${userId}`;
}

export function buildPreviewParticipantNameFromAuthenticatedParticipant(
  authenticatedParticipantName?: string,
): string | undefined {
  const normalizedParticipantName = authenticatedParticipantName?.trim();

  if (!normalizedParticipantName) {
    return undefined;
  }

  const match = /^user:(\d+)$/.exec(normalizedParticipantName);

  if (!match) {
    return normalizedParticipantName;
  }

  return `preview:user:${match[1]}`;
}
