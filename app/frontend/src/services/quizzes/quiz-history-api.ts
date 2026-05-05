import type { QuizHistoryItem } from "../../types/quiz";
import { request } from "../http/api-client";

export const quizHistoryApi = {
  listMyHistory(accessToken: string) {
    return request<{ history: QuizHistoryItem[] }>("/quiz-history/me", {
      accessToken,
    });
  },
};
