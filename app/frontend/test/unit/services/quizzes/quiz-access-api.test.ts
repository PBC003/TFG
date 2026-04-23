import { beforeEach, describe, expect, it, vi } from "vitest";
import { quizAccessApi } from "../../../../src/services/quizzes/quiz-access-api";
import { request } from "../../../../src/services/http/api-client";

vi.mock("../../../../src/services/http/api-client", () => ({
  request: vi.fn(),
}));

describe("quizAccessApi", () => {
  beforeEach(() => {
    vi.mocked(request).mockReset();
  });

  it("calls the expected authenticated quiz access endpoints", () => {
    quizAccessApi.listPublishedQuizzes("token-1");
    quizAccessApi.getBestResult("token-1", "quiz-1");
    quizAccessApi.startAttempt("token-1", {
      quizId: "quiz-1",
      accessCode: "ABCD",
    });
    quizAccessApi.submitAttempt("token-1", "attempt-1", {
      answers: [{ questionId: "q-1", value: true }],
    });

    expect(request).toHaveBeenNthCalledWith(1, "/quiz-access/quizzes", {
      accessToken: "token-1",
    });
    expect(request).toHaveBeenNthCalledWith(
      2,
      "/quiz-access/quizzes/quiz-1/best-result",
      { accessToken: "token-1" },
    );
    expect(request).toHaveBeenNthCalledWith(3, "/quiz-access/start", {
      method: "POST",
      body: { quizId: "quiz-1", accessCode: "ABCD" },
      accessToken: "token-1",
    });
    expect(request).toHaveBeenNthCalledWith(
      4,
      "/quiz-access/attempts/attempt-1/submit",
      {
        method: "POST",
        body: { answers: [{ questionId: "q-1", value: true }] },
        accessToken: "token-1",
      },
    );
  });
});
