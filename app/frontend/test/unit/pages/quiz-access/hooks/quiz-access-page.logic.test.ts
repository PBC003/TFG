import { describe, expect, it } from "vitest";
import type {
  PublicQuizCatalogItem,
  QuizAttemptItem,
  QuizSubmissionResult,
} from "../../../../../src/types/quiz";
import {
  buildSubmitAnswersPayload,
  getCanRequestBestResult,
  getSelectedQuizStartDisabled,
  normalizeStartAttemptPayload,
  shouldAutoSubmitExpiredAttempt,
} from "../../../../../src/pages/quiz-access/utils/quiz-access-page.logic";

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
  expiresAt: "2026-04-12T10:05:00.000Z",
  questions: [],
};

const submittedResult: QuizSubmissionResult = {
  attemptId: "attempt-1",
  quizId: "quiz-1",
  title: "Quiz 1",
  participantName: "Pablo",
  attemptNumber: 1,
  attemptsAllowed: 2,
  attemptsRemaining: 0,
  status: "submitted",
  submittedAt: "2026-04-12T10:05:00.000Z",
  earnedPoints: 2,
  maxPoints: 2,
  scoreOverTen: 10,
  canRevealFeedback: true,
  revealBlockedByEndDate: false,
  review: [],
};

describe("quiz-access-page.logic", () => {
  it("normalizes explicit start-attempt options before hitting the API", () => {
    expect(
      normalizeStartAttemptPayload(
        { quizId: "quiz-2", accessCode: " ab-12 " },
        "quiz-1",
        " xyz ",
      ),
    ).toEqual({ quizId: "quiz-2", accessCode: "AB-12" });

    expect(normalizeStartAttemptPayload(undefined, "quiz-1", " xyz ")).toEqual({
      quizId: "quiz-1",
      accessCode: "XYZ",
    });
  });

  it("derives the catalog CTA states from the selected quiz and participant state", () => {
    expect(
      getSelectedQuizStartDisabled({
        starting: false,
        participantIdentity: "Pablo",
        selectedQuiz: publicQuiz,
        accessCode: "ABCD",
      }),
    ).toBe(false);

    expect(
      getSelectedQuizStartDisabled({
        starting: false,
        participantIdentity: "Pablo",
        selectedQuiz: { ...publicQuiz, attemptsRemaining: 0 },
        accessCode: "ABCD",
      }),
    ).toBe(true);

    expect(getCanRequestBestResult(publicQuiz, "Pablo")).toBe(false);
    expect(
      getCanRequestBestResult({ ...publicQuiz, attemptsRemaining: 0 }, "Pablo"),
    ).toBe(true);
  });

  it("builds submit payloads and only triggers auto-submit when an attempt has expired", () => {
    expect(
      buildSubmitAnswersPayload({
        "q-1": true,
        "q-2": ["A", "C"],
      }),
    ).toEqual([
      { questionId: "q-1", value: true },
      { questionId: "q-2", value: ["A", "C"] },
    ]);

    expect(
      shouldAutoSubmitExpiredAttempt({
        activeAttempt,
        autoSubmitTriggered: false,
        submitting: false,
        result: null,
        nowMs: new Date("2026-04-12T10:04:59.000Z").getTime(),
      }),
    ).toBe(false);

    expect(
      shouldAutoSubmitExpiredAttempt({
        activeAttempt,
        autoSubmitTriggered: false,
        submitting: false,
        result: null,
        nowMs: new Date("2026-04-12T10:05:01.000Z").getTime(),
      }),
    ).toBe(true);

    expect(
      shouldAutoSubmitExpiredAttempt({
        activeAttempt,
        autoSubmitTriggered: false,
        submitting: false,
        result: submittedResult,
        nowMs: new Date("2026-04-12T10:05:01.000Z").getTime(),
      }),
    ).toBe(false);
  });
});
