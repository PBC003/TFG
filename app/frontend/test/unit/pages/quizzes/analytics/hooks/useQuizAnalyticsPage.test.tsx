import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useQuizAnalyticsPage } from "../../../../../../src/pages/quizzes/analytics/hooks/useQuizAnalyticsPage";
import { useAuth } from "../../../../../../src/hooks/useAuth";
import { quizAnalyticsApi } from "../../../../../../src/services/quizzes/quiz-analytics-api";
import { downloadCsvFile } from "../../../../../../src/pages/quizzes/analytics/utils/quiz-analytics.utils";
import { createAuthValue } from "../../../../../utils/auth";
import { createT } from "../../../../../utils/i18n";
import type {
  QuizAnalyticsItem,
  QuizAttemptReviewDetail,
} from "../../../../../../src/types/quiz";

vi.mock("../../../../../../src/hooks/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("../../../../../../src/services/quizzes/quiz-analytics-api", () => ({
  quizAnalyticsApi: {
    getQuizAnalytics: vi.fn(),
    getAttemptDetail: vi.fn(),
    exportQuizCsv: vi.fn(),
  },
}));
vi.mock(
  "../../../../../../src/pages/quizzes/analytics/utils/quiz-analytics.utils",
  async () => {
    const actual = await vi.importActual<
      typeof import("../../../../../../src/pages/quizzes/analytics/utils/quiz-analytics.utils")
    >(
      "../../../../../../src/pages/quizzes/analytics/utils/quiz-analytics.utils",
    );
    return { ...actual, downloadCsvFile: vi.fn() };
  },
);

const analytics: QuizAnalyticsItem = {
  quizId: "quiz-1",
  title: "Quiz 1",
  description: "Desc",
  status: "published",
  hasAttempts: true,
  generatedAt: "2026-04-12T10:00:00.000Z",
  summary: {
    totalAttempts: 3,
    completedAttempts: 3,
    submittedAttempts: 2,
    expiredAttempts: 1,
    inProgressAttempts: 0,
    uniqueParticipants: 2,
    averageScoreOverTen: 7,
    bestScoreOverTen: 9,
    worstScoreOverTen: 4,
    averageCompletionMinutes: 7.5,
  },
  scoreDistribution: [],
  attempts: [
    {
      attemptId: "attempt-1",
      quizId: "quiz-1",
      participantName: "user:1",
      participantDisplayName: "Álvaro García",
      attemptNumber: 1,
      status: "submitted",
      startedAt: "2026-04-12T10:00:00.000Z",
      submittedAt: "2026-04-12T10:05:00.000Z",
      expiresAt: null,
      earnedPoints: 8,
      maxPoints: 10,
      scoreOverTen: 8,
      questionCount: 3,
    },
    {
      attemptId: "attempt-2",
      quizId: "quiz-1",
      participantName: "user:2",
      participantDisplayName: "Ada Lovelace",
      attemptNumber: 1,
      status: "expired",
      startedAt: "2026-04-12T11:00:00.000Z",
      submittedAt: "2026-04-12T11:10:00.000Z",
      expiresAt: null,
      earnedPoints: 4,
      maxPoints: 10,
      scoreOverTen: 4,
      questionCount: 3,
    },
  ],
  questionStats: [],
};

const detail: QuizAttemptReviewDetail = {
  attemptId: "attempt-1",
  quizId: "quiz-1",
  title: "Quiz 1",
  participantName: "user:1",
  participantDisplayName: "Álvaro García",
  attemptNumber: 1,
  status: "submitted",
  startedAt: "2026-04-12T10:00:00.000Z",
  submittedAt: "2026-04-12T10:05:00.000Z",
  expiresAt: null,
  earnedPoints: 8,
  maxPoints: 10,
  scoreOverTen: 8,
  review: [],
};

describe("useQuizAnalyticsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue(createAuthValue() as never);
    vi.mocked(quizAnalyticsApi.getQuizAnalytics).mockResolvedValue({
      analytics,
    });
    vi.mocked(quizAnalyticsApi.getAttemptDetail).mockResolvedValue({ detail });
    vi.mocked(quizAnalyticsApi.exportQuizCsv).mockResolvedValue("a;b;c");
  });

  it("loads analytics, filters/paginates attempts and opens detail/export flows", async () => {
    const t = createT();
    const { result } = renderHook(() =>
      useQuizAnalyticsPage({ quizId: "quiz-1", t }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.analytics?.quizId).toBe("quiz-1");
    expect(result.current.paginatedAttempts).toHaveLength(2);

    act(() => {
      result.current.setAttemptSearch("ada");
    });
    expect(result.current.filteredAttempts).toHaveLength(1);
    expect(result.current.attemptsPage).toBe(0);

    act(() => {
      result.current.setAttemptsRowsPerPage(1);
    });
    expect(result.current.attemptsRowsPerPage).toBe(1);

    await act(async () => {
      await result.current.handleOpenDetail("attempt-1");
    });
    expect(result.current.detail?.attemptId).toBe("attempt-1");

    await act(async () => {
      await result.current.handleExport();
    });
    expect(downloadCsvFile).toHaveBeenCalledWith(
      "quiz-quiz-1-results.csv",
      "a;b;c",
    );
    expect(result.current.feedback).toEqual({
      severity: "success",
      message: "quizAnalytics.exportSuccess",
    });
  });

  it("stores translated errors and skips loading when the quiz id is missing", async () => {
    vi.mocked(quizAnalyticsApi.getQuizAnalytics).mockRejectedValueOnce(
      new Error("boom"),
    );
    const t = createT();

    const { result, rerender } = renderHook(
      ({ quizId }) => useQuizAnalyticsPage({ quizId, t }),
      { initialProps: { quizId: "quiz-1" } },
    );

    await waitFor(() =>
      expect(result.current.feedback).toEqual({
        severity: "error",
        message: "boom",
      }),
    );

    rerender({ quizId: "" });
    await act(async () => {
      await result.current.loadAnalytics();
    });
    expect(quizAnalyticsApi.getQuizAnalytics).toHaveBeenCalledTimes(1);
  });

  it("stores detail/export errors and skips export when analytics are missing", async () => {
    const t = createT();
    const { result } = renderHook(() =>
      useQuizAnalyticsPage({ quizId: "quiz-1", t }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(quizAnalyticsApi.getAttemptDetail).mockRejectedValueOnce(
      new Error("boom-detail"),
    );
    await act(async () => {
      await result.current.handleOpenDetail("attempt-1");
    });
    expect(result.current.feedback).toEqual({
      severity: "error",
      message: "boom-detail",
    });

    vi.mocked(quizAnalyticsApi.exportQuizCsv).mockRejectedValueOnce(
      new Error("boom-export"),
    );
    await act(async () => {
      await result.current.handleExport();
    });
    expect(result.current.feedback).toEqual({
      severity: "error",
      message: "boom-export",
    });

    const { result: emptyResult } = renderHook(() =>
      useQuizAnalyticsPage({ quizId: "", t }),
    );
    await act(async () => {
      await emptyResult.current.handleExport();
    });
    expect(quizAnalyticsApi.exportQuizCsv).toHaveBeenCalledTimes(1);
  });
});
