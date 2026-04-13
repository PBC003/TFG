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

  it("calls the expected public quiz access endpoints", () => {
    quizAccessApi.listPublishedQuizzes(" Pablo ");
    quizAccessApi.listPublishedQuizzes();
    quizAccessApi.getBestResult("quiz-1", " Pablo ");
    quizAccessApi.startAttempt({
      quizId: "quiz-1",
      accessCode: "ABCD",
      participantName: "Pablo",
    });
    quizAccessApi.submitAttempt("attempt-1", {
      answers: [{ questionId: "q-1", value: true }],
    });

    expect(request).toHaveBeenNthCalledWith(
      1,
      "/quiz-access/quizzes?participantName=Pablo",
    );
    expect(request).toHaveBeenNthCalledWith(2, "/quiz-access/quizzes");
    expect(request).toHaveBeenNthCalledWith(
      3,
      "/quiz-access/quizzes/quiz-1/best-result?participantName=Pablo",
    );
    expect(request).toHaveBeenNthCalledWith(4, "/quiz-access/start", {
      method: "POST",
      body: { quizId: "quiz-1", accessCode: "ABCD", participantName: "Pablo" },
    });
    expect(request).toHaveBeenNthCalledWith(
      5,
      "/quiz-access/attempts/attempt-1/submit",
      {
        method: "POST",
        body: { answers: [{ questionId: "q-1", value: true }] },
      },
    );
  });
});
