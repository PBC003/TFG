import type {
  QuizAnalyticsItem,
  QuizAttemptReviewDetail,
} from "../../types/quiz";
import { request, requestText } from "../http/api-client";

export const quizAnalyticsApi = {
  getQuizAnalytics(accessToken: string, quizId: string) {
    return request<{ analytics: QuizAnalyticsItem }>(
      `/quizzes/${quizId}/analytics`,
      {
        accessToken,
      },
    );
  },
  getAttemptDetail(accessToken: string, quizId: string, attemptId: string) {
    return request<{ detail: QuizAttemptReviewDetail }>(
      `/quizzes/${quizId}/attempts/${attemptId}/detail`,
      {
        accessToken,
      },
    );
  },
  exportQuizCsv(accessToken: string, quizId: string) {
    return requestText(`/quizzes/${quizId}/export`, {
      accessToken,
    });
  },
};
