import { beforeEach, describe, expect, it, vi } from "vitest";
import { quizzesApi } from "../../../../src/services/quizzes/quizzes-api";
import { request } from "../../../../src/services/http/api-client";

vi.mock("../../../../src/services/http/api-client", () => ({
  request: vi.fn(),
}));

describe("quizzesApi", () => {
  beforeEach(() => {
    vi.mocked(request).mockReset();
  });

  it("calls the expected teacher quiz endpoints", () => {
    const payload = {
      title: "Quiz 1",
      description: "Desc",
      accessCode: "ABCD",
      requiresAccessCode: true,
      attemptsAllowed: 2,
      startAt: null,
      endAt: null,
      timeLimitMinutes: null,
      shuffleQuestions: false,
      revealAnswersAfterClose: false,
      assignedGroupIds: ["group-1"],
      questions: [{ questionId: "q-1", points: 2 }],
    };

    quizzesApi.listQuizzes("token");
    quizzesApi.createQuiz("token", payload);
    quizzesApi.updateQuiz("token", "quiz-1", { title: "Updated" });
    quizzesApi.publishQuiz("token", "quiz-1");
    quizzesApi.unpublishQuiz("token", "quiz-1");
    quizzesApi.deleteQuiz("token", "quiz-1");
    quizzesApi.startPreview("token", "quiz-1");

    expect(request).toHaveBeenNthCalledWith(1, "/quizzes", {
      accessToken: "token",
    });
    expect(request).toHaveBeenNthCalledWith(2, "/quizzes", {
      method: "POST",
      accessToken: "token",
      body: payload,
    });
    expect(request).toHaveBeenNthCalledWith(3, "/quizzes/quiz-1", {
      method: "PATCH",
      accessToken: "token",
      body: { title: "Updated" },
    });
    expect(request).toHaveBeenNthCalledWith(4, "/quizzes/quiz-1/publish", {
      method: "POST",
      accessToken: "token",
    });
    expect(request).toHaveBeenNthCalledWith(5, "/quizzes/quiz-1/unpublish", {
      method: "POST",
      accessToken: "token",
    });
    expect(request).toHaveBeenNthCalledWith(6, "/quizzes/quiz-1", {
      method: "DELETE",
      accessToken: "token",
    });
    expect(request).toHaveBeenNthCalledWith(
      7,
      "/quizzes/quiz-1/preview/start",
      {
        method: "POST",
        accessToken: "token",
      },
    );
  });
});
