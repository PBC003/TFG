import type {
  PublicQuizCatalogItem,
  QuizAttemptItem,
  QuizSubmissionResult,
} from "../../types/quiz";
import { request } from "../http/api-client";

export const quizAccessApi = {
  listPublishedQuizzes(accessToken: string) {
    return request<{ quizzes: PublicQuizCatalogItem[] }>(
      "/quiz-access/quizzes",
      {
        accessToken,
      },
    );
  },
  getBestResult(accessToken: string, quizId: string) {
    return request<{ result: QuizSubmissionResult | null }>(
      `/quiz-access/quizzes/${quizId}/best-result`,
      {
        accessToken,
      },
    );
  },
  startAttempt(
    accessToken: string,
    payload: {
      quizId?: string;
      accessCode?: string | null;
    },
  ) {
    return request<{ attempt: QuizAttemptItem }>("/quiz-access/start", {
      method: "POST",
      body: payload,
      accessToken,
    });
  },
  submitAttempt(
    accessToken: string,
    attemptId: string,
    payload: { answers: Array<{ questionId: string; value: unknown }> },
  ) {
    return request<{ result: QuizSubmissionResult }>(
      `/quiz-access/attempts/${attemptId}/submit`,
      {
        method: "POST",
        body: payload,
        accessToken,
      },
    );
  },
};
