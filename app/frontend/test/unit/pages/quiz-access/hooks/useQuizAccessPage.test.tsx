import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
    isAvailableNow: true,
    canStart: true,
  };
  const activeAttempt: QuizAttemptItem = {
    attemptId: "attempt-1",
    quizId: "quiz-1",
    title: "Quiz 1",
    description: "Desc",
    accessCode: "ABCD",
    participantName: "Pablo",
    attemptNumber: 1,
    attemptsAllowed: 2,
    attemptsRemaining: 1,
    status: "in_progress",
    startedAt: "2026-04-12T10:00:00.000Z",
    expiresAt: "2099-04-12T10:05:00.000Z",
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
    participantName: "Pablo",
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

  beforeEach(() => {
    vi.clearAllMocks();
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

  it("loads the catalog, starts attempts, updates answers and submits them", async () => {
    const t = createT();
    const { result } = renderHook(() =>
      useQuizAccessPage({
        routeQuizId: "quiz-1",
        participantIdentity: "Pablo",
        t,
      }),
    );

    await waitFor(() => expect(result.current.catalogLoading).toBe(false));
    expect(result.current.selectedQuiz?.quizId).toBe("quiz-1");
    expect(result.current.selectedQuizStartDisabled).toBe(true);

    act(() => {
      result.current.setAccessCode(" abcd ");
      result.current.setCatalogSearch("quiz");
    });
    expect(result.current.filteredCatalog).toHaveLength(1);
    expect(result.current.selectedQuizStartDisabled).toBe(false);

    await act(async () => {
      await result.current.handleStartAttempt();
    });
    expect(quizAccessApi.startAttempt).toHaveBeenCalledWith({
      quizId: "quiz-1",
      accessCode: "ABCD",
      participantName: "Pablo",
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
    expect(quizAccessApi.submitAttempt).toHaveBeenCalledWith("attempt-1", {
      answers: [{ questionId: "q-1", value: true }],
    });
    expect(result.current.result?.attemptId).toBe("attempt-1");
    expect(result.current.feedback).toEqual({
      severity: "success",
      message: "quizAccess.submitSuccess",
    });

    act(() => {
      result.current.resetLookup();
    });
    expect(result.current.activeAttempt).toBeNull();
    expect(result.current.result).toBeNull();
  });

  it("handles best-result loading, validation branches and translated errors", async () => {
    const t = createT();
    const initialProps: { routeQuizId?: string; participantIdentity: string } =
      {
        routeQuizId: "quiz-1",
        participantIdentity: "Pablo",
      };
    const { result, rerender } = renderHook(
      ({ routeQuizId, participantIdentity }: typeof initialProps) =>
        useQuizAccessPage({ routeQuizId, participantIdentity, t }),
      { initialProps },
    );

    await waitFor(() => expect(result.current.catalogLoading).toBe(false));

    await act(async () => {
      await result.current.handleLoadBestResult();
    });
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

    rerender({ routeQuizId: undefined, participantIdentity: "" });
    act(() => {
      result.current.setAccessCode("");
    });
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
    rerender({ routeQuizId: "quiz-1", participantIdentity: "Pablo" });
    await act(async () => {
      await result.current.refreshCatalog();
    });
    expect(result.current.feedback).toEqual({
      severity: "error",
      message: "translated-error",
    });
    expect(getErrorMessage).toHaveBeenCalled();
  });
});
