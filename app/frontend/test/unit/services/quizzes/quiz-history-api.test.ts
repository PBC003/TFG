import { beforeEach, describe, expect, it, vi } from "vitest";
import { quizHistoryApi } from "../../../../src/services/quizzes/quiz-history-api";
import { request } from "../../../../src/services/http/api-client";

vi.mock("../../../../src/services/http/api-client", () => ({
  request: vi.fn(),
}));

describe("quizHistoryApi", () => {
  beforeEach(() => {
    vi.mocked(request).mockReset();
  });

  it("calls the expected history endpoint", () => {
    quizHistoryApi.listMyHistory("token");

    expect(request).toHaveBeenCalledWith("/quiz-history/me", {
      accessToken: "token",
    });
  });
});
