import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  ATTEMPTS_ROWS_PER_PAGE_OPTIONS,
  DEFAULT_ATTEMPTS_ROWS_PER_PAGE,
  downloadCsvFile,
  filterAttemptsByParticipant,
  normalizeSearchText,
  paginateItems,
} from "../../../../../../src/pages/quizzes/analytics/utils/quiz-analytics.utils";
import type { QuizAnalyticsAttemptItem } from "../../../../../../src/types/quiz";

const baseAttempt: QuizAnalyticsAttemptItem = {
  attemptId: "attempt-1",
  quizId: "quiz-1",
  participantName: "user:1",
  participantDisplayName: "Álvaro García",
  attemptNumber: 1,
  status: "submitted",
  startedAt: "2026-04-12T10:00:00.000Z",
  submittedAt: "2026-04-12T10:05:00.000Z",
  expiresAt: null,
  earnedPoints: 7,
  maxPoints: 10,
  scoreOverTen: 7,
  questionCount: 3,
};

describe("quiz-analytics.utils", () => {
  const createObjectURL = vi.fn(() => "blob:url");
  const revokeObjectURL = vi.fn();
  const click = vi.fn();
  let createElementSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });
    createElementSpy = vi.spyOn(document, "createElement").mockReturnValue({
      href: "",
      download: "",
      click,
    } as unknown as HTMLAnchorElement);
  });

  afterEach(() => {
    createElementSpy.mockRestore();
  });

  it("exports constants and formats helper values", () => {
    expect(ATTEMPTS_ROWS_PER_PAGE_OPTIONS).toEqual([5, 10, 25]);
    expect(DEFAULT_ATTEMPTS_ROWS_PER_PAGE).toBe(5);
    expect(normalizeSearchText("  ÁlVARO  ")).toBe("alvaro");
  });

  it("filters attempts by normalized participant names and paginates collections", () => {
    const attempts = [
      baseAttempt,
      {
        ...baseAttempt,
        attemptId: "attempt-2",
        participantDisplayName: "Ada Lovelace",
      },
      {
        ...baseAttempt,
        attemptId: "attempt-3",
        participantDisplayName: "Alan Turing",
      },
    ];

    expect(filterAttemptsByParticipant(attempts, "")).toEqual(attempts);
    expect(filterAttemptsByParticipant(attempts, "garcia")).toEqual([
      attempts[0],
    ]);
    expect(filterAttemptsByParticipant(attempts, "ADA")).toEqual([attempts[1]]);
    expect(paginateItems(attempts, 1, 2)).toEqual([attempts[2]]);
  });

  it("downloads csv content through a temporary anchor", () => {
    downloadCsvFile("report.csv", "a;b;c");

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:url");
  });
});
