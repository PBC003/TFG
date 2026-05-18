import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  QuizAnalyticsItem,
  QuizAttemptReviewDetail,
} from "../../../../src/types/quiz";
import QuizAnalyticsPage from "../../../../src/pages/quizzes/QuizAnalyticsPage";
import { useQuizAnalyticsPage } from "../../../../src/pages/quizzes/analytics/hooks/useQuizAnalyticsPage";

const mockNavigate = vi.fn();
const mockUseParams = vi.fn(() => ({ quizId: "quiz-1" }));
const mockPrint = vi.fn();

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

vi.mock(
  "../../../../src/pages/quizzes/analytics/hooks/useQuizAnalyticsPage",
  () => ({
    useQuizAnalyticsPage: vi.fn(),
  }),
);

vi.mock(
  "../../../../src/pages/quizzes/analytics/components/QuizAnalyticsHeaderCard",
  () => ({
    QuizAnalyticsHeaderCard: (props: {
      title: string;
      description: string;
      onBack: () => void;
      onExportStats: () => void;
      backLabel: string;
      exportStatsLabel: string;
    }) => (
      <div data-testid="header-card">
        <div>{`${props.title}|${props.description}`}</div>
        <button onClick={props.onBack}>{props.backLabel}</button>
        <button onClick={props.onExportStats}>{props.exportStatsLabel}</button>
      </div>
    ),
  }),
);

vi.mock(
  "../../../../src/pages/quizzes/analytics/components/QuizAnalyticsSummaryGrid",
  () => ({
    QuizAnalyticsSummaryGrid: ({
      items,
    }: {
      items: Array<{ label: string; value: number | string }>;
    }) => (
      <div data-testid="summary-grid">
        {items.map((item) => `${item.label}:${item.value}`).join(",")}
      </div>
    ),
  }),
);

vi.mock(
  "../../../../src/pages/quizzes/analytics/components/QuizAnalyticsDistributionCard",
  () => ({
    QuizAnalyticsDistributionCard: ({
      title,
      labels,
      outcomeLabels,
    }: {
      title: string;
      labels: string[];
      outcomeLabels: { passed: string; failed: string; completed: string };
    }) => (
      <div data-testid="distribution-card">
        {`${title}|${labels.join(",")}|${outcomeLabels.passed}|${outcomeLabels.failed}|${outcomeLabels.completed}`}
      </div>
    ),
  }),
);

vi.mock(
  "../../../../src/pages/quizzes/analytics/components/QuizAnalyticsAttemptsCard",
  () => ({
    QuizAnalyticsAttemptsCard: (props: {
      allAttemptsCount: number;
      filteredAttemptsCount: number;
      labels: { title: string };
      onExport: () => void;
      getStatusLabel: (status: string) => string;
      onSearchChange: (value: string) => void;
      onPageChange: (value: number) => void;
      onRowsPerPageChange: (value: number) => void;
      onOpenDetail: (attemptId: string) => void;
    }) => (
      <div data-testid="attempts-card">
        <div>
          {`${props.labels.title}|${props.allAttemptsCount}|${props.filteredAttemptsCount}|${props.getStatusLabel("submitted")}`}
        </div>
        <button onClick={() => props.onSearchChange("Ada")}>search</button>
        <button onClick={() => props.onPageChange(2)}>page</button>
        <button onClick={() => props.onRowsPerPageChange(10)}>rows</button>
        <button onClick={() => props.onOpenDetail("attempt-1")}>detail</button>
        <button onClick={props.onExport}>quizAnalytics.exportCsv</button>
      </div>
    ),
  }),
);

vi.mock(
  "../../../../src/pages/quizzes/analytics/components/QuizAnalyticsQuestionStatsCard",
  () => ({
    QuizAnalyticsQuestionStatsCard: ({
      title,
      stats,
      labels,
    }: {
      title: string;
      stats: Array<{ questionId: string; type: string }>;
      labels: { getTypeLabel: (type: string) => string };
    }) => (
      <div data-testid="question-stats-card">
        {`${title}|${stats.map((item) => `${item.questionId}:${labels.getTypeLabel(item.type)}`).join(",")}`}
      </div>
    ),
  }),
);

vi.mock(
  "../../../../src/pages/quizzes/components/QuizAttemptDetailDialog",
  () => ({
    QuizAttemptDetailDialog: ({
      detail,
      onClose,
    }: {
      detail: QuizAttemptReviewDetail | null;
      onClose: () => void;
    }) => (
      <div data-testid="detail-dialog">
        <div>{detail?.attemptId ?? "empty"}</div>
        <button onClick={onClose}>close-detail</button>
      </div>
    ),
  }),
);

const analytics: QuizAnalyticsItem = {
  quizId: "quiz-1",
  title: "Quiz analytics",
  description: "Summary",
  status: "published",
  hasAttempts: true,
  generatedAt: "2026-04-12T10:00:00.000Z",
  summary: {
    totalAttempts: 4,
    completedAttempts: 4,
    submittedAttempts: 3,
    expiredAttempts: 1,
    inProgressAttempts: 0,
    uniqueParticipants: 2,
    averageScoreOverTen: 7,
    bestScoreOverTen: 10,
    worstScoreOverTen: 5,
    averageCompletionMinutes: 6.5,
  },
  scoreDistribution: [],
  attempts: [
    {
      attemptId: "attempt-1",
      quizId: "quiz-1",
      participantName: "user:1",
      participantDisplayName: "Ada Lovelace",
      attemptNumber: 1,
      status: "submitted",
      startedAt: "2026-04-12T10:00:00.000Z",
      submittedAt: "2026-04-12T10:05:00.000Z",
      expiresAt: null,
      earnedPoints: 8,
      maxPoints: 10,
      scoreOverTen: 8,
      questionCount: 3,
    },
  ],
  questionStats: [
    {
      questionId: "q-1",
      title: "Question 1",
      statement: "Statement",
      type: "true_false",
      order: 0,
      maxPoints: 2,
      attempts: 4,
      correctCount: 3,
      incorrectCount: 1,
      unansweredCount: 0,
      averageEarnedPoints: 1.5,
      correctRate: 75,
      answerDistribution: [
        { key: "true", label: "true", count: 3, isCorrect: true },
        { key: "false", label: "false", count: 1, isCorrect: false },
      ],
    },
  ],
};

const detail: QuizAttemptReviewDetail = {
  attemptId: "attempt-1",
  quizId: "quiz-1",
  title: "Quiz analytics",
  participantName: "user:1",
  participantDisplayName: "Ada Lovelace",
  attemptNumber: 1,
  status: "submitted",
  startedAt: "2026-04-12T10:00:00.000Z",
  submittedAt: "2026-04-12T10:05:00.000Z",
  expiresAt: null,
  earnedPoints: 8,
  maxPoints: 10,
  scoreOverTen: 8,
  review: [],
};

function buildHookResult(
  overrides: Partial<ReturnType<typeof useQuizAnalyticsPage>> = {},
) {
  return {
    analytics,
    detail,
    loading: false,
    exporting: false,
    detailLoading: false,
    attemptSearch: "",
    attemptsPage: 0,
    attemptsRowsPerPage: 5,
    feedback: null,
    filteredAttempts: analytics.attempts,
    paginatedAttempts: analytics.attempts,
    distributionLabels: ["failed", "pass"],
    setAttemptSearch: vi.fn(),
    setAttemptsPage: vi.fn(),
    setAttemptsRowsPerPage: vi.fn(),
    setDetail: vi.fn(),
    setFeedback: vi.fn(),
    loadAnalytics: vi.fn(async () => undefined),
    handleOpenDetail: vi.fn(async () => undefined),
    handleExport: vi.fn(async () => undefined),
    ...overrides,
  } as ReturnType<typeof useQuizAnalyticsPage>;
}

describe("QuizAnalyticsPage", () => {
  beforeEach(() => {
    mockPrint.mockClear();
    Object.defineProperty(window, "print", {
      configurable: true,
      value: mockPrint,
    });
  });

  it("renders loading state when analytics are not ready", () => {
    vi.mocked(useQuizAnalyticsPage).mockReturnValue(
      buildHookResult({ analytics: null, detail: null, loading: true }),
    );

    render(
      <MemoryRouter>
        <QuizAnalyticsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("common.loading")).toBeInTheDocument();
  });

  it("renders analytics cards, translated labels and delegates actions", () => {
    const hook = buildHookResult({
      feedback: { severity: "success", message: "ok" },
    });
    vi.mocked(useQuizAnalyticsPage).mockReturnValue(hook);

    render(
      <MemoryRouter>
        <QuizAnalyticsPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("header-card")).toBeInTheDocument();
    expect(screen.getByText("ok")).toBeInTheDocument();
    expect(screen.getByTestId("summary-grid")).toBeInTheDocument();
    expect(screen.getByTestId("summary-grid")).toHaveTextContent(
      "quizAnalytics.summary.averageCompletionMinutes:6 quizAnalytics.duration.minutes 30 quizAnalytics.duration.seconds",
    );
    expect(screen.getByTestId("summary-grid")).not.toHaveTextContent(
      "quizAnalytics.summary.worstScore",
    );
    expect(screen.getByTestId("distribution-card")).toBeInTheDocument();
    expect(screen.getByTestId("distribution-card")).toHaveTextContent(
      "quizAnalytics.distributionOutcomes.passed",
    );
    expect(screen.getByTestId("attempts-card")).toHaveTextContent(
      "quizAnalytics.status.submitted",
    );
    expect(screen.getByTestId("question-stats-card")).toHaveTextContent(
      "questions.types.true_false",
    );
    expect(screen.getByTestId("detail-dialog")).toHaveTextContent("attempt-1");

    fireEvent.click(
      screen.getByRole("button", { name: "quizAnalytics.backToQuizzes" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "quizAnalytics.exportStats" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "quizAnalytics.exportCsv" }),
    );
    fireEvent.click(screen.getByText("search"));
    fireEvent.click(screen.getByText("page"));
    fireEvent.click(screen.getByText("rows"));
    fireEvent.click(screen.getByText("detail"));
    fireEvent.click(screen.getByText("close-detail"));

    expect(mockNavigate).toHaveBeenCalledWith("/quizzes");
    expect(mockPrint).toHaveBeenCalledTimes(1);
    expect(hook.handleExport).toHaveBeenCalledTimes(1);
    expect(hook.setAttemptSearch).toHaveBeenCalledWith("Ada");
    expect(hook.setAttemptsPage).toHaveBeenNthCalledWith(1, 2);
    expect(hook.setAttemptsRowsPerPage).toHaveBeenCalledWith(10);
    expect(hook.setAttemptsPage).toHaveBeenNthCalledWith(2, 0);
    expect(hook.handleOpenDetail).toHaveBeenCalledWith("attempt-1");
    expect(hook.setDetail).toHaveBeenCalledWith(null);
  });
});
