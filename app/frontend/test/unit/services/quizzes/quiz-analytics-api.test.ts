import { beforeEach, describe, expect, it, vi } from "vitest";
import { quizAnalyticsApi } from "../../../../src/services/quizzes/quiz-analytics-api";
import { request, requestText } from "../../../../src/services/http/api-client";

vi.mock("../../../../src/services/http/api-client", () => ({
  request: vi.fn(),
  requestText: vi.fn(),
}));

describe("quizAnalyticsApi", () => {
  beforeEach(() => {
    vi.mocked(request).mockReset();
    vi.mocked(requestText).mockReset();
  });

  it("calls the expected analytics endpoints", () => {
    quizAnalyticsApi.getQuizAnalytics("token", "quiz-1");
    quizAnalyticsApi.getAttemptDetail("token", "quiz-1", "attempt-1");
    quizAnalyticsApi.exportQuizCsv("token", "quiz-1");

    expect(request).toHaveBeenNthCalledWith(1, "/quizzes/quiz-1/analytics", {
      accessToken: "token",
    });
    expect(request).toHaveBeenNthCalledWith(
      2,
      "/quizzes/quiz-1/attempts/attempt-1/detail",
      { accessToken: "token" },
    );
    expect(requestText).toHaveBeenNthCalledWith(1, "/quizzes/quiz-1/export", {
      accessToken: "token",
    });
  });
});
