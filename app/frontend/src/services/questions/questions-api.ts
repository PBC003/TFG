import type {
  CreateQuestionInput,
  QuestionItem,
  UpdateQuestionInput,
} from "../../types/question";
import { request } from "../http/api-client";

export const questionsApi = {
  listQuestions(accessToken: string) {
    return request<{ questions: QuestionItem[] }>("/questions", {
      accessToken,
    });
  },
  createQuestion(accessToken: string, payload: CreateQuestionInput) {
    return request<{ question: QuestionItem }>("/questions", {
      method: "POST",
      accessToken,
      body: payload,
    });
  },
  updateQuestion(
    accessToken: string,
    questionId: string,
    payload: UpdateQuestionInput,
  ) {
    return request<{ question: QuestionItem }>(`/questions/${questionId}`, {
      method: "PATCH",
      accessToken,
      body: payload,
    });
  },
  deleteQuestion(accessToken: string, questionId: string) {
    return request<void>(`/questions/${questionId}`, {
      method: "DELETE",
      accessToken,
    });
  },
};
