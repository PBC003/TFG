import type { QuizAnalyticsAttemptItem } from "../../../../types/quiz";

export const ATTEMPTS_ROWS_PER_PAGE_OPTIONS = [5, 10, 25];
export const DEFAULT_ATTEMPTS_ROWS_PER_PAGE = 5;

export function downloadCsvFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function formatRawScore(earnedPoints: number, maxPoints: number) {
  return `${earnedPoints} / ${maxPoints}`;
}

export function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function filterAttemptsByParticipant(
  attempts: QuizAnalyticsAttemptItem[],
  search: string,
): QuizAnalyticsAttemptItem[] {
  const normalizedSearch = normalizeSearchText(search);

  if (!normalizedSearch) {
    return attempts;
  }

  return attempts.filter((attempt) =>
    normalizeSearchText(attempt.participantDisplayName).includes(
      normalizedSearch,
    ),
  );
}

export function paginateItems<T>(
  items: T[],
  page: number,
  rowsPerPage: number,
): T[] {
  const startIndex = page * rowsPerPage;
  return items.slice(startIndex, startIndex + rowsPerPage);
}
