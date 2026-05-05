import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import QuizSimulationPage from "../../../../src/pages/quizzes/QuizSimulationPage";
import { useAuth } from "../../../../src/hooks/useAuth";
import { quizzesApi } from "../../../../src/services/quizzes/quizzes-api";
import { quizAccessApi } from "../../../../src/services/quizzes/quiz-access-api";
import { createAuthValue } from "../../../utils/auth";
import type {
  QuizAttemptItem,
  QuizSubmissionResult,
} from "../../../../src/types/quiz";

const mockNavigate = vi.fn();
const mockUseParams = vi.fn((): { quizId?: string } => ({
  quizId: "quiz-1",
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

vi.mock("../../../../src/hooks/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("../../../../src/services/quizzes/quizzes-api", () => ({
  quizzesApi: { startPreview: vi.fn() },
}));
vi.mock("../../../../src/services/quizzes/quiz-access-api", () => ({
  quizAccessApi: { submitAttempt: vi.fn() },
}));
vi.mock(
  "../../../../src/pages/quiz-access/components/QuizActiveAttemptHeaderCard",
  () => ({
    QuizActiveAttemptHeaderCard: ({
      attempt,
    }: {
      attempt: QuizAttemptItem;
    }) => <div data-testid="attempt-header">{attempt.attemptId}</div>,
  }),
);
vi.mock(
  "../../../../src/pages/quiz-access/components/QuizAttemptSection",
  () => ({
    QuizAttemptSection: (props: {
      attempt: QuizAttemptItem;
      answers: Record<string, unknown>;
      submitting: boolean;
      onAnswerChange: (id: string, value: unknown) => void;
      onSubmit: () => void;
    }) => (
      <div data-testid="attempt-section">
        <div>{`${props.attempt.attemptId}|${Object.keys(props.answers).length}|${props.submitting}`}</div>
        <button onClick={() => props.onAnswerChange("q-1", true)}>
          answer
        </button>
        <button onClick={() => props.onSubmit()}>submit</button>
      </div>
    ),
  }),
);
vi.mock(
  "../../../../src/pages/quiz-access/components/QuizResultSection",
  () => ({
    QuizResultSection: (props: {
      result: QuizSubmissionResult;
      starting: boolean;
      onNewLookup: () => void;
      onStartAnotherAttempt: () => void;
    }) => (
      <div data-testid="result-section">
        <div>{`${props.result.attemptId}|${props.starting}`}</div>
        <button onClick={props.onNewLookup}>back-to-quizzes</button>
        <button onClick={props.onStartAnotherAttempt}>restart-result</button>
      </div>
    ),
  }),
);

const attempt: QuizAttemptItem = {
  attemptId: "attempt-1",
  quizId: "quiz-1",
  title: "Quiz preview",
  description: "Description",
  accessCode: null,
  participantName: "preview:user:1",
  attemptNumber: 1,
  attemptsAllowed: 99,
  attemptsRemaining: 98,
  status: "in_progress",
  startedAt: "2026-04-12T10:00:00.000Z",
  expiresAt: "2099-04-12T11:00:00.000Z",
  questions: [],
  isPreview: true,
};

const result: QuizSubmissionResult = {
  attemptId: "attempt-1",
  quizId: "quiz-1",
  title: "Quiz preview",
  participantName: "preview:user:1",
  attemptNumber: 1,
  attemptsAllowed: 99,
  attemptsRemaining: 98,
  status: "submitted",
  submittedAt: "2026-04-12T10:05:00.000Z",
  earnedPoints: 8,
  maxPoints: 10,
  scoreOverTen: 8,
  canRevealFeedback: true,
  revealBlockedByEndDate: false,
  review: [],
  isPreview: true,
};

describe("QuizSimulationPage", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    vi.mocked(useAuth).mockReturnValue(createAuthValue() as never);
    vi.mocked(quizzesApi.startPreview).mockResolvedValue({ attempt });
    vi.mocked(quizAccessApi.submitAttempt).mockResolvedValue({ result });
  });

  it("loads previews, submits answers and supports navigation actions", async () => {
    render(
      <MemoryRouter>
        <QuizSimulationPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("attempt-header")).toHaveTextContent(
        "attempt-1",
      ),
    );
    await waitFor(() =>
      expect(screen.queryByText("common.loading")).not.toBeInTheDocument(),
    );
    expect(quizzesApi.startPreview).toHaveBeenCalledWith("token", "quiz-1");

    fireEvent.click(screen.getByText("answer"));
    expect(screen.getByTestId("attempt-section")).toHaveTextContent(
      "attempt-1|1|false",
    );

    fireEvent.click(screen.getByText("submit"));

    await waitFor(() =>
      expect(quizAccessApi.submitAttempt).toHaveBeenCalledWith(
        "token",
        "attempt-1",
        {
          answers: [{ questionId: "q-1", value: true }],
        },
      ),
    );
    await waitFor(() =>
      expect(
        screen.getByText("quizzes.simulation.submitSuccess"),
      ).toBeInTheDocument(),
    );

    fireEvent.click(
      screen.getByRole("button", { name: "quizzes.simulation.back" }),
    );
    expect(mockNavigate).toHaveBeenCalledWith("/quizzes");

    const callsBeforeRestart = vi.mocked(quizzesApi.startPreview).mock.calls
      .length;
    fireEvent.click(
      screen.getByRole("button", { name: "quizzes.simulation.restart" }),
    );
    await waitFor(() =>
      expect(
        vi.mocked(quizzesApi.startPreview).mock.calls.length,
      ).toBeGreaterThan(callsBeforeRestart),
    );
  }, 15000);

  it("shows translated errors while loading previews", async () => {
    vi.mocked(quizzesApi.startPreview).mockRejectedValueOnce(new Error("boom"));

    render(
      <MemoryRouter>
        <QuizSimulationPage />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText("boom")).toBeInTheDocument());
  }, 10000);

  it("does not call preview loading when the route has no quizId", async () => {
    mockUseParams.mockReturnValueOnce({});
    vi.mocked(quizzesApi.startPreview).mockClear();

    render(
      <MemoryRouter>
        <QuizSimulationPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("common.loading")).toBeInTheDocument();
    expect(quizzesApi.startPreview).not.toHaveBeenCalled();
  });

  it("shows submit errors and routes result actions after a successful preview", async () => {
    vi.mocked(quizAccessApi.submitAttempt).mockRejectedValueOnce(
      new Error("submit boom"),
    );

    render(
      <MemoryRouter>
        <QuizSimulationPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("attempt-section")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText("submit"));

    await waitFor(() =>
      expect(screen.getByText("submit boom")).toBeInTheDocument(),
    );

    vi.mocked(quizAccessApi.submitAttempt).mockResolvedValueOnce({ result });
    fireEvent.click(screen.getByText("answer"));
    fireEvent.click(screen.getByText("submit"));

    await waitFor(() =>
      expect(screen.getByTestId("result-section")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText("back-to-quizzes"));
    const previewCallsBeforeRestart = vi.mocked(quizzesApi.startPreview).mock
      .calls.length;
    fireEvent.click(screen.getByText("restart-result"));

    expect(mockNavigate).toHaveBeenCalledWith("/quizzes");
    await waitFor(() =>
      expect(
        vi.mocked(quizzesApi.startPreview).mock.calls.length,
      ).toBeGreaterThan(previewCallsBeforeRestart),
    );
  }, 15000);
});
