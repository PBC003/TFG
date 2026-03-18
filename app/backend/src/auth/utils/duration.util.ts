export type DurationString =
  | `${number}s`
  | `${number}m`
  | `${number}h`
  | `${number}d`;

const DURATION_REGEX = /^(\d+)(s|m|h|d)$/i;

const UNIT_TO_MS = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
} as const;

export function parseDurationToMs(duration: DurationString): number {
  const match = duration.trim().match(DURATION_REGEX);

  if (!match) {
    throw new Error(
      `Unsupported duration format: ${duration}. Use values like 15m, 12h or 7d.`,
    );
  }

  const [, value, unit] = match;

  return (
    Number(value) * UNIT_TO_MS[unit.toLowerCase() as keyof typeof UNIT_TO_MS]
  );
}

export function addDurationToDate(
  duration: DurationString,
  from = new Date(),
): Date {
  return new Date(from.getTime() + parseDurationToMs(duration));
}
