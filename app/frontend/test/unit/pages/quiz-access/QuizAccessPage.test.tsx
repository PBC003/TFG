import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import QuizAccessPage from "../../../../src/pages/quiz-access/QuizAccessPage";
import type {
  PublicQuizCatalogItem,
  QuizAttemptItem,
  QuizSubmissionResult,
} from "../../../../src/types/quiz";

const mockNavigate = vi.fn();
const mockUseParams = vi.fn();
const mockUseAuth = vi.fn();
const mockUseQuizAccessPage = vi.fn();

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

vi.mock("../../../../src/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("../../../../src/pages/quiz-access/hooks/useQuizAccessPage", () => ({
  useQuizAccessPage: (...args: unknown[]) => mockUseQuizAccessPage(...args),
}));

vi.mock(
  "../../../../src/pages/quiz-access/components/QuizCatalogSection",
  () => ({
    QuizCatalogSection: (props: {
      search: string;
      filteredCatalog: PublicQuizCatalogItem[];
      paginatedCatalog: PublicQuizCatalogItem[];
      page: number;
      rowsPerPage: number;
      onSearchChange: (value: string) => void;
      onPageChange: (page: number) => void;
      onRowsPerPageChange: (rows: number) => void;
      onOpenQuiz: (quizId: string) => void;
    }) => (
      <div data-testid="catalog-section">
        <div>{`${props.search}|${props.page}|${props.rowsPerPage}`}</div>
        <div>{props.filteredCatalog.map((quiz) => quiz.quizId).join(",")}</div>
        <div>{props.paginatedCatalog.map((quiz) => quiz.quizId).join(",")}</div>
        <button onClick={() => props.onSearchChange("nuevo")}>search</button>
        <button onClick={() => props.onPageChange(2)}>page</button>
        <button onClick={() => props.onRowsPerPageChange(25)}>rows</button>
        <button onClick={() => props.onOpenQuiz("quiz-open")}>open</button>
      </div>
    ),
  }),
);

vi.mock(
  "../../../../src/pages/quiz-access/components/SelectedQuizCard",
  () => ({
    SelectedQuizCard: (props: {
      quiz: PublicQuizCatalogItem;
      accessCode: string;
      startDisabled: boolean;
      loading: boolean;
      reviewLoading: boolean;
      canRequestBestResult: boolean;
      onAccessCodeChange: (value: string) => void;
      onStart: () => void;
      onLoadBestResult: () => void;
      onResetLookup: () => void;
    }) => (
      <div data-testid="selected-quiz-card">
        <div>{props.quiz.quizId}</div>
        <div>{`${props.accessCode}|${props.startDisabled}|${props.loading}|${props.reviewLoading}|${props.canRequestBestResult}`}</div>
        <button onClick={() => props.onAccessCodeChange("ABCD")}>code</button>
        <button onClick={props.onStart}>start</button>
        <button onClick={props.onLoadBestResult}>best-result</button>
        <button onClick={props.onResetLookup}>reset</button>
      </div>
    ),
  }),
);

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
      onAnswerChange: (questionId: string, value: unknown) => void;
      onSubmit: () => void;
    }) => (
      <div data-testid="attempt-section">
        <div>{`${props.attempt.attemptId}|${Object.keys(props.answers).length}|${props.submitting}`}</div>
        <button onClick={() => props.onAnswerChange("q-1", true)}>
          answer
        </button>
        <button onClick={props.onSubmit}>submit</button>
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
        <button onClick={props.onNewLookup}>new-lookup</button>
        <button onClick={props.onStartAnotherAttempt}>start-another</button>
      </div>
    ),
  }),
);

const selectedQuiz: PublicQuizCatalogItem = {
  quizId: "quiz-1",
  title: "Quiz 1",
  description: "Desc",
  teacherName: "Teacher",
  requiresAccessCode: true,
  attemptsAllowed: 2,
  attemptsRemaining: 1,
  totalQuestions: 3,
  totalPoints: 6,
  startAt: "2026-04-12T10:00:00.000Z",
  endAt: "2026-04-13T10:00:00.000Z",
  timeLimitMinutes: 30,
  publishedAt: "2026-04-12T09:00:00.000Z",
  isAvailableNow: true,
  canStart: true,
};

const activeAttempt: QuizAttemptItem = {
  attemptId: "attempt-1",
  quizId: "quiz-1",
  title: "Intento",
  description: "Descripción",
  accessCode: "ABCD",
  participantName: "Pablo",
  attemptNumber: 1,
  attemptsAllowed: 2,
  attemptsRemaining: 1,
  status: "in_progress",
  startedAt: "2026-04-12T10:00:00.000Z",
  expiresAt: "2026-04-12T11:00:00.000Z",
  questions: [],
};

const result: QuizSubmissionResult = {
  attemptId: "attempt-1",
  quizId: "quiz-1",
  title: "Resultado",
  participantName: "Pablo",
  attemptNumber: 1,
  attemptsAllowed: 2,
  attemptsRemaining: 1,
  status: "submitted",
  submittedAt: "2026-04-12T11:00:00.000Z",
  earnedPoints: 5,
  maxPoints: 6,
  scoreOverTen: 8.33,
  canRevealFeedback: true,
  revealBlockedByEndDate: false,
  review: [],
};

function buildHookResult(overrides: Record<string, unknown> = {}) {
  return {
    accessCode: "CODE",
    catalogSearch: "",
    starting: false,
    submitting: false,
    reviewLoading: false,
    catalogLoading: false,
    feedback: null,
    activeAttempt: null,
    answers: {},
    result: null,
    catalogPage: 0,
    catalogRowsPerPage: 5,
    nowMs: 0,
    selectedQuiz: null,
    filteredCatalog: [selectedQuiz],
    paginatedCatalog: [selectedQuiz],
    selectedQuizStartDisabled: false,
    canRequestBestResult: true,
    setAccessCode: vi.fn(),
    setCatalogSearch: vi.fn(),
    setCatalogPage: vi.fn(),
    setCatalogRowsPerPage: vi.fn(),
    setFeedback: vi.fn(),
    updateAnswer: vi.fn(),
    handleStartAttempt: vi.fn(async () => undefined),
    handleSubmitAttempt: vi.fn(async () => undefined),
    handleLoadBestResult: vi.fn(async () => undefined),
    resetLookup: vi.fn(),
    ...overrides,
  };
}

describe("QuizAccessPage", () => {
  it("renders intro and catalog lookup mode without route quiz id", () => {
    const hook = buildHookResult({
      feedback: { severity: "success", message: "ok" },
    });
    mockUseAuth.mockReturnValue({ user: { id: 7 } });
    mockUseParams.mockReturnValue({});
    mockUseQuizAccessPage.mockReturnValue(hook);

    render(<QuizAccessPage />);

    expect(screen.getByText("quizAccess.title")).toBeInTheDocument();
    expect(screen.getByText("quizAccess.subtitle")).toBeInTheDocument();
    expect(screen.getByText("ok")).toBeInTheDocument();
    expect(screen.getByTestId("catalog-section")).toBeInTheDocument();

    fireEvent.click(screen.getByText("search"));
    fireEvent.click(screen.getByText("page"));
    fireEvent.click(screen.getByText("rows"));
    fireEvent.click(screen.getByText("open"));

    expect(hook.setCatalogSearch).toHaveBeenCalledWith("nuevo");
    expect(hook.setCatalogPage).toHaveBeenNthCalledWith(1, 2);
    expect(hook.setCatalogRowsPerPage).toHaveBeenCalledWith(25);
    expect(hook.setCatalogPage).toHaveBeenNthCalledWith(2, 0);
    expect(mockNavigate).toHaveBeenCalledWith("/quiz-access/quiz-open");
  });

  it("renders not found state for route lookup and navigates back to lookup", () => {
    const hook = buildHookResult({ selectedQuiz: null });
    mockUseAuth.mockReturnValue({ user: null });
    mockUseParams.mockReturnValue({ quizId: "missing" });
    mockUseQuizAccessPage.mockReturnValue(hook);

    render(<QuizAccessPage />);

    expect(screen.getByText("errors.codes.quiz.not_found")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "quizAccess.actions.newLookup" }),
    );

    expect(hook.resetLookup).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/quiz-access");
  });

  it("renders selected quiz card for route quiz id and wires card callbacks", () => {
    const hook = buildHookResult({ selectedQuiz });
    mockUseAuth.mockReturnValue({ user: { id: 9 } });
    mockUseParams.mockReturnValue({ quizId: "quiz-1" });
    mockUseQuizAccessPage.mockReturnValue(hook);

    render(<QuizAccessPage />);

    expect(screen.getByTestId("selected-quiz-card")).toHaveTextContent(
      "quiz-1",
    );

    fireEvent.click(screen.getByText("code"));
    fireEvent.click(screen.getByText("start"));
    fireEvent.click(screen.getByText("best-result"));
    fireEvent.click(screen.getByText("reset"));

    expect(hook.setAccessCode).toHaveBeenCalledWith("ABCD");
    expect(hook.handleStartAttempt).toHaveBeenCalledWith({
      quizId: "quiz-1",
      accessCode: "CODE",
    });
    expect(hook.handleLoadBestResult).toHaveBeenCalledWith("quiz-1");
    expect(hook.resetLookup).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/quiz-access");
  });

  it("renders active attempt and result sections when present", () => {
    const hook = buildHookResult({
      activeAttempt,
      result,
      answers: { "q-1": true },
      submitting: true,
      starting: true,
    });
    mockUseAuth.mockReturnValue({ user: { id: 2 } });
    mockUseParams.mockReturnValue({ quizId: "quiz-1" });
    mockUseQuizAccessPage.mockReturnValue(hook);

    render(<QuizAccessPage />);

    expect(screen.getByTestId("attempt-header")).toHaveTextContent("attempt-1");
    expect(screen.getByTestId("attempt-section")).toHaveTextContent(
      "attempt-1|1|true",
    );
    expect(screen.getByTestId("result-section")).toHaveTextContent(
      "attempt-1|true",
    );

    fireEvent.click(screen.getByText("answer"));
    fireEvent.click(screen.getByText("submit"));
    fireEvent.click(screen.getByText("new-lookup"));
    fireEvent.click(screen.getByText("start-another"));

    expect(hook.updateAnswer).toHaveBeenCalledWith("q-1", true);
    expect(hook.handleSubmitAttempt).toHaveBeenCalledTimes(1);
    expect(hook.handleStartAttempt).toHaveBeenCalledTimes(1);
    expect(hook.resetLookup).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/quiz-access");
  });
});
