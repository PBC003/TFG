export function calculateAttemptsRemaining(
  attemptsAllowed: number,
  consumedAttempts: number,
): number {
  return Math.max(0, attemptsAllowed - consumedAttempts);
}

export function buildAttemptExpiresAt(
  startedAt: Date,
  timeLimitMinutes: number | null,
): Date | null {
  if (timeLimitMinutes === null) {
    return null;
  }

  return new Date(startedAt.getTime() + timeLimitMinutes * 60_000);
}
