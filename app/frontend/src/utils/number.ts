export function formatNumber(
  value: number,
  language: string,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(language, {
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

export function formatPercentValue(value: number, language: string): string {
  return `${formatNumber(value, language)}%`;
}

export function formatRawScore(
  earnedPoints: number,
  maxPoints: number,
  language: string,
): string {
  return `${formatNumber(earnedPoints, language)} / ${formatNumber(
    maxPoints,
    language,
  )}`;
}
