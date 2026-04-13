export type QuizAccessDataRequiredThrower = (
  code: 'quiz.access_data_required',
  message: string,
) => never;

export function normalizeParticipantIdentity(
  value: string | null | undefined,
): string {
  return value?.trim() ?? '';
}

export function hasParticipantIdentity(value: string): boolean {
  return value.length >= 2;
}

export function assertParticipantIdentityForReview(
  participantName: string,
  throwBadRequest: QuizAccessDataRequiredThrower,
): void {
  if (hasParticipantIdentity(participantName)) {
    return;
  }

  throwBadRequest(
    'quiz.access_data_required',
    'A participant identity is required to retrieve quiz feedback',
  );
}
