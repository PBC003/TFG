import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import QuizHistoryPage from "../../../../src/pages/quiz-history/QuizHistoryPage";
import { useAuth } from "../../../../src/hooks/useAuth";
import { quizHistoryApi } from "../../../../src/services/quizzes/quiz-history-api";
import { createAuthValue } from "../../../utils/auth";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
vi.mock("../../../../src/hooks/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("../../../../src/services/quizzes/quiz-history-api", () => ({
  quizHistoryApi: { listMyHistory: vi.fn() },
}));

describe("QuizHistoryPage", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue(createAuthValue() as never);
  });

  it("renders loading, empty and populated history states", async () => {
    vi.mocked(quizHistoryApi.listMyHistory).mockResolvedValueOnce({
      history: [],
    });

    const firstRender = render(
      <MemoryRouter>
        <QuizHistoryPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("common.loading")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("quizHistory.empty")).toBeInTheDocument(),
    );

    vi.mocked(quizHistoryApi.listMyHistory).mockResolvedValueOnce({
      history: [
        {
          attemptId: "attempt-1",
          quizId: "quiz-1",
          quizTitle: "Quiz 1",
          quizDescription: "Description",
          status: "submitted",
          attemptNumber: 2,
          startedAt: "2026-04-12T10:00:00.000Z",
          submittedAt: "2026-04-12T10:05:00.000Z",
          earnedPoints: 8,
          maxPoints: 10,
          scoreOverTen: 8,
          totalQuestions: 3,
        },
      ],
    });

    firstRender.unmount();

    render(
      <MemoryRouter>
        <QuizHistoryPage />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("Quiz 1")).toBeInTheDocument());
    fireEvent.click(
      screen.getByRole("button", { name: "quizHistory.openQuiz" }),
    );
    expect(mockNavigate).toHaveBeenCalledWith("/quiz-access/quiz-1");
  });

  it("shows translated loading errors", async () => {
    vi.mocked(quizHistoryApi.listMyHistory).mockRejectedValueOnce(
      new Error("boom"),
    );

    render(
      <MemoryRouter>
        <QuizHistoryPage />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("boom")).toBeInTheDocument());
  });
});
