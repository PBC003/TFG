export function roundToTwo(value: number): number {
  return Number(value.toFixed(2));
}

export function computeScoreOverTen(
  earnedPoints: number,
  maxPoints: number,
): number {
  if (maxPoints <= 0) {
    return 0;
  }

  return roundToTwo((earnedPoints / maxPoints) * 10);
}

export function isEmptyAnswer(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return false;
}

export function serializeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return JSON.stringify(value) ?? '';
}

export function escapeCsvField(value: unknown): string {
  const normalized = serializeCsvValue(value).replace(/\r?\n/g, ' ');

  if (/[",;]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
}
