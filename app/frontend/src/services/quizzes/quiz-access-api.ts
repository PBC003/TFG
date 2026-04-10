import type {
  PublicQuizCatalogItem,
  QuizAttemptItem,
  QuizSubmissionResult,
} from "../../types/quiz";
import { request } from "../http/api-client";

export const quizAccessApi = {
  listPublishedQuizzes(participantName?: string) {
    const query = participantName?.trim()
      ? `?participantName=${encodeURIComponent(participantName.trim())}`
      : "";

    return request<{ quizzes: PublicQuizCatalogItem[] }>(
      `/quiz-access/quizzes${query}`,
    );
  },
  startAttempt(payload: {
    quizId?: string;
    accessCode?: string | null;
    participantName: string;
  }) {
    return request<{ attempt: QuizAttemptItem }>("/quiz-access/start", {
      method: "POST",
      body: payload,
    });
  },
  submitAttempt(
    attemptId: string,
    payload: { answers: Array<{ questionId: string; value: unknown }> },
  ) {
    return request<{ result: QuizSubmissionResult }>(
      `/quiz-access/attempts/${attemptId}/submit`,
      {
        method: "POST",
        body: payload,
      },
    );
  },
};
