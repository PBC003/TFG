import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useQuizAccessPage } from "../../../../../src/pages/quiz-access/hooks/useQuizAccessPage";
import { quizAccessApi } from "../../../../../src/services/quizzes/quiz-access-api";
import type {
  PublicQuizCatalogItem,
  QuizAttemptItem,
  QuizSubmissionResult,
} from "../../../../../src/types/quiz";
import { getErrorMessage } from "../../../../../src/utils/error-code";
import { createT } from "../../../../utils/i18n";

vi.mock("../../../../../src/services/quizzes/quiz-access-api", () => ({
  quizAccessApi: {
    listPublishedQuizzes: vi.fn(),
    getBestResult: vi.fn(),
    startAttempt: vi.fn(),
    submitAttempt: vi.fn(),
  },
}));

vi.mock("../../../../../src/utils/error-code", () => ({
  getErrorMessage: vi.fn(() => "translated-error"),
}));

describe("useQuizAccessPage", () => {
  const publicQuiz: PublicQuizCatalogItem = {
    quizId: "quiz-1",
    title: "Quiz 1",
    description: "Desc",
    teacherName: "Ada",
    requiresAccessCode: true,
    attemptsAllowed: 2,
    attemptsRemaining: 1,
    totalQuestions: 1,
    totalPoints: 2,
    startAt: null,
    endAt: null,
    timeLimitMinutes: 10,
    publishedAt: "2026-04-12T10:00:00.000Z",
    audienceScope: "all",
    isAvailableNow: true,
    canStart: true,
  };

  const activeAttempt: QuizAttemptItem = {
    attemptId: "attempt-1",
    quizId: "quiz-1",
    title: "Quiz 1",
    description: "Desc",
    accessCode: "ABCD",
    participantName: "user:7",
    attemptNumber: 1,
    attemptsAllowed: 2,
    attemptsRemaining: 1,
    status: "in_progress",
    startedAt: "2026-04-12T10:00:00.000Z",
    expiresAt: null,
    questions: [
      {
        questionId: "q-1",
        title: "Question",
        type: "true_false",
        statement: "Statement",
        explanation: "Explanation",
        tags: [],
        points: 2,
        order: 0,
        questionConfig: {},
      },
    ],
  };

  const resultPayload: QuizSubmissionResult = {
    attemptId: "attempt-1",
    quizId: "quiz-1",
    title: "Quiz 1",
    participantName: "user:7",
    attemptNumber: 1,
    attemptsAllowed: 2,
    attemptsRemaining: 0,
    status: "submitted",
    submittedAt: "2026-04-12T10:03:00.000Z",
    earnedPoints: 2,
    maxPoints: 2,
    scoreOverTen: 10,
    canRevealFeedback: true,
    revealBlockedByEndDate: false,
    review: [],
  };

  type SessionOperation<T> = (accessToken: string) => Promise<T>;

  const executeWithSessionMock = vi.fn(
    async (operation: SessionOperation<unknown>) => operation("token-1"),
  );

  const executeWithSession = async <T,>(
    operation: SessionOperation<T>,
  ): Promise<T> =>
    executeWithSessionMock(
      operation as SessionOperation<unknown>,
    ) as Promise<T>;

  beforeEach(() => {
    vi.clearAllMocks();

    executeWithSessionMock.mockImplementation(
      async (operation: SessionOperation<unknown>) => operation("token-1"),
    );

    vi.mocked(quizAccessApi.listPublishedQuizzes).mockResolvedValue({
      quizzes: [publicQuiz],
    });
    vi.mocked(quizAccessApi.getBestResult).mockResolvedValue({
      result: resultPayload,
    });
    vi.mocked(quizAccessApi.startAttempt).mockResolvedValue({
      attempt: activeAttempt,
    });
    vi.mocked(quizAccessApi.submitAttempt).mockResolvedValue({
      result: resultPayload,
    });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("loads the catalog, starts attempts, updates answers and submits them", async () => {
    const t = createT();
    const { result, unmount } = renderHook(() =>
      useQuizAccessPage({
        routeQuizId: "quiz-1",
        isAuthenticated: true,
        executeWithSession,
        t,
      }),
    );

    await waitFor(() => expect(result.current.catalogLoading).toBe(false));

    expect(result.current.selectedQuiz?.quizId).toBe("quiz-1");
    expect(result.current.paginatedCatalog).toHaveLength(1);
    expect(result.current.selectedQuizStartDisabled).toBe(true);

    act(() => {
      result.current.setAccessCode(" abcd ");
      result.current.setCatalogSearch("quiz");
    });

    expect(result.current.filteredCatalog).toHaveLength(1);
    expect(result.current.selectedQuizStartDisabled).toBe(false);

    await act(async () => {
      await result.current.handleStartAttempt({
        quizId: "quiz-1",
        accessCode: " zx9 ",
      });
    });

    expect(executeWithSessionMock).toHaveBeenCalled();
    expect(quizAccessApi.startAttempt).toHaveBeenCalledWith("token-1", {
      quizId: "quiz-1",
      accessCode: "ZX9",
    });

    await waitFor(() =>
      expect(result.current.activeAttempt?.attemptId).toBe("attempt-1"),
    );

    act(() => {
      result.current.updateAnswer("q-1", true);
    });

    expect(result.current.answers).toEqual({ "q-1": true });

    await act(async () => {
      await result.current.handleSubmitAttempt();
    });

    expect(quizAccessApi.submitAttempt).toHaveBeenCalledWith(
      "token-1",
      "attempt-1",
      {
        answers: [{ questionId: "q-1", value: true }],
      },
    );
    expect(result.current.result?.attemptId).toBe("attempt-1");
    expect(result.current.feedback).toEqual({
      severity: "success",
      message: "quizAccess.submitSuccess",
    });

    unmount();
  });

  it("handles best-result loading, auth guards and translated errors", async () => {
    const t = createT();
    const initialProps: { routeQuizId?: string; isAuthenticated: boolean } = {
      routeQuizId: "quiz-1",
      isAuthenticated: true,
    };

    const { result, rerender, unmount } = renderHook(
      ({ routeQuizId, isAuthenticated }: typeof initialProps) =>
        useQuizAccessPage({
          routeQuizId,
          isAuthenticated,
          executeWithSession,
          t,
        }),
      { initialProps },
    );

    await waitFor(() => expect(result.current.catalogLoading).toBe(false));

    await act(async () => {
      await result.current.handleLoadBestResult();
    });

    expect(quizAccessApi.getBestResult).toHaveBeenCalledWith(
      "token-1",
      "quiz-1",
    );
    expect(result.current.result?.attemptId).toBe("attempt-1");

    vi.mocked(quizAccessApi.getBestResult).mockResolvedValueOnce({
      result: null,
    });

    await act(async () => {
      await result.current.handleLoadBestResult();
    });

    expect(result.current.feedback).toEqual({
      severity: "info",
      message: "quizAccess.bestResultUnavailable",
    });

    rerender({ routeQuizId: undefined, isAuthenticated: false });

    await act(async () => {
      await result.current.handleStartAttempt();
    });

    expect(result.current.feedback).toEqual({
      severity: "error",
      message: "errors.codes.common.unauthorized",
    });

    vi.mocked(quizAccessApi.listPublishedQuizzes).mockRejectedValueOnce(
      new Error("boom"),
    );

    rerender({ routeQuizId: "quiz-1", isAuthenticated: true });

    await act(async () => {
      await result.current.refreshCatalog();
    });

    expect(result.current.feedback).toEqual({
      severity: "error",
      message: "translated-error",
    });
    expect(getErrorMessage).toHaveBeenCalled();

    unmount();
  });

  it("surfaces info branches for missing lookup data and unavailable best result", async () => {
    const t = createT();
    const { result, unmount } = renderHook(() =>
      useQuizAccessPage({
        routeQuizId: undefined,
        isAuthenticated: true,
        executeWithSession,
        t,
      }),
    );

    await waitFor(() => expect(result.current.catalogLoading).toBe(false));

    await act(async () => {
      await result.current.handleStartAttempt();
    });

    expect(result.current.feedback).toEqual({
      severity: "info",
      message: "quizAccess.accessLookupRequired",
    });

    await act(async () => {
      await result.current.handleLoadBestResult();
    });

    expect(result.current.feedback).toEqual({
      severity: "info",
      message: "quizAccess.bestResultUnavailable",
    });

    unmount();
  });

  it("stores translated errors when start, submit and best-result requests fail", async () => {
    const t = createT();
    const { result, unmount } = renderHook(() =>
      useQuizAccessPage({
        routeQuizId: "quiz-1",
        isAuthenticated: true,
        executeWithSession,
        t,
      }),
    );

    await waitFor(() => expect(result.current.catalogLoading).toBe(false));

    vi.mocked(quizAccessApi.startAttempt).mockRejectedValueOnce(
      new Error("boom-start"),
    );

    await act(async () => {
      await result.current.handleStartAttempt({
        quizId: "quiz-1",
        accessCode: "ABCD",
      });
    });

    expect(result.current.feedback).toEqual({
      severity: "error",
      message: "translated-error",
    });

    vi.mocked(quizAccessApi.startAttempt).mockResolvedValueOnce({
      attempt: activeAttempt,
    });

    await act(async () => {
      await result.current.handleStartAttempt({
        quizId: "quiz-1",
        accessCode: "ABCD",
      });
    });

    vi.mocked(quizAccessApi.submitAttempt).mockRejectedValueOnce(
      new Error("boom-submit"),
    );

    await act(async () => {
      await result.current.handleSubmitAttempt();
    });

    expect(result.current.feedback).toEqual({
      severity: "error",
      message: "translated-error",
    });

    vi.mocked(quizAccessApi.getBestResult).mockRejectedValueOnce(
      new Error("boom-best"),
    );

    await act(async () => {
      await result.current.handleLoadBestResult("quiz-1");
    });

    expect(result.current.feedback).toEqual({
      severity: "error",
      message: "translated-error",
    });
    expect(getErrorMessage).toHaveBeenCalled();

    unmount();
  });
});
