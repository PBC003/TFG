export type DurationUnitLabels = {
  hour: string;
  hours: string;
  minute: string;
  minutes: string;
  second: string;
  seconds: string;
};

function getUnitLabel(value: number, singular: string, plural: string): string {
  return value === 1 ? singular : plural;
}

export function formatDurationFromMinutes(
  minutes: number,
  labels: DurationUnitLabels,
): string {
  const totalSeconds = Math.max(0, Math.round(minutes * 60));
  const hours = Math.floor(totalSeconds / 3600);
  const remainingSeconds = totalSeconds % 3600;
  const wholeMinutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const parts = [
    hours > 0
      ? `${hours} ${getUnitLabel(hours, labels.hour, labels.hours)}`
      : null,
    wholeMinutes > 0
      ? `${wholeMinutes} ${getUnitLabel(
          wholeMinutes,
          labels.minute,
          labels.minutes,
        )}`
      : null,
    seconds > 0
      ? `${seconds} ${getUnitLabel(seconds, labels.second, labels.seconds)}`
      : null,
  ].filter(Boolean);

  return parts.length > 0
    ? parts.join(" ")
    : `0 ${labels.seconds}`;
}
