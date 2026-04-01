import { beforeEach, describe, expect, it, vi } from "vitest";
import { questionsApi } from "../../../../src/services/questions/questions-api";
import { request } from "../../../../src/services/http/api-client";

vi.mock("../../../../src/services/http/api-client", () => ({
  request: vi.fn(),
}));

describe("questionsApi", () => {
  beforeEach(() => {
    vi.mocked(request).mockReset();
  });

  it("calls the expected questions endpoints with the right payloads", () => {
    questionsApi.listQuestions("token");
    questionsApi.createQuestion("token", {
      title: "Integral",
      type: "true_false",
      statement: "\\int x dx",
      questionConfig: { correctAnswer: true },
    });
    questionsApi.updateQuestion("token", "q-1", {
      title: "Nueva",
    });
    questionsApi.deleteQuestion("token", "q-2");

    expect(request).toHaveBeenNthCalledWith(1, "/questions", {
      accessToken: "token",
    });
    expect(request).toHaveBeenNthCalledWith(2, "/questions", {
      method: "POST",
      accessToken: "token",
      body: {
        title: "Integral",
        type: "true_false",
        statement: "\\int x dx",
        questionConfig: { correctAnswer: true },
      },
    });
    expect(request).toHaveBeenNthCalledWith(3, "/questions/q-1", {
      method: "PATCH",
      accessToken: "token",
      body: { title: "Nueva" },
    });
    expect(request).toHaveBeenNthCalledWith(4, "/questions/q-2", {
      method: "DELETE",
      accessToken: "token",
    });
  });
});
