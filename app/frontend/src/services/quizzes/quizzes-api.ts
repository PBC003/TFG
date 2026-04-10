import type {
  CreateQuizInput,
  QuizItem,
  UpdateQuizInput,
} from "../../types/quiz";
import { request } from "../http/api-client";

export const quizzesApi = {
  listQuizzes(accessToken: string) {
    return request<{ quizzes: QuizItem[] }>("/quizzes", {
      accessToken,
    });
  },
  createQuiz(accessToken: string, payload: CreateQuizInput) {
    return request<{ quiz: QuizItem }>("/quizzes", {
      method: "POST",
      accessToken,
      body: payload,
    });
  },
  updateQuiz(accessToken: string, quizId: string, payload: UpdateQuizInput) {
    return request<{ quiz: QuizItem }>(`/quizzes/${quizId}`, {
      method: "PATCH",
      accessToken,
      body: payload,
    });
  },
  publishQuiz(accessToken: string, quizId: string) {
    return request<{ quiz: QuizItem }>(`/quizzes/${quizId}/publish`, {
      method: "POST",
      accessToken,
    });
  },
  unpublishQuiz(accessToken: string, quizId: string) {
    return request<{ quiz: QuizItem }>(`/quizzes/${quizId}/unpublish`, {
      method: "POST",
      accessToken,
    });
  },
  deleteQuiz(accessToken: string, quizId: string) {
    return request<{ success: true }>(`/quizzes/${quizId}`, {
      method: "DELETE",
      accessToken,
    });
  },
};
