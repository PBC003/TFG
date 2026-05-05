import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { QuestionItem } from "../../../../src/types/question";
import type { GroupItem } from "../../../../src/types/group";
import type { QuizItem } from "../../../../src/types/quiz";
import QuizzesPage from "../../../../src/pages/quizzes/QuizzesPage";
import { useQuizzesPage } from "../../../../src/pages/quizzes/hooks/useQuizzesPage";

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

vi.mock("../../../../src/pages/quizzes/hooks/useQuizzesPage", () => ({
  useQuizzesPage: vi.fn(),
}));

vi.mock(
  "../../../../src/pages/quizzes/components/QuizzesPageHeaderCard",
  () => ({
    QuizzesPageHeaderCard: (props: {
      onRefresh: () => void;
      onCreate: () => void;
      loading: boolean;
      submitting: boolean;
    }) => (
      <div data-testid="header-card">
        <div>{`${props.loading}-${props.submitting}`}</div>
        <button onClick={props.onRefresh}>refresh</button>
        <button onClick={props.onCreate}>create</button>
      </div>
    ),
  }),
);

vi.mock("../../../../src/pages/quizzes/components/QuizzesFiltersCard", () => ({
  QuizzesFiltersCard: (props: {
    search: string;
    statusFilter: string;
    visibleCount: number;
    onSearchChange: (value: string) => void;
    onStatusFilterChange: (value: "all" | "draft" | "published") => void;
  }) => (
    <div data-testid="filters-card">
      <div>{`${props.search}|${props.statusFilter}|${props.visibleCount}`}</div>
      <button onClick={() => props.onSearchChange("nuevo")}>search</button>
      <button onClick={() => props.onStatusFilterChange("published")}>
        status
      </button>
    </div>
  ),
}));

vi.mock("../../../../src/pages/quizzes/components/QuizzesTableCard", () => ({
  QuizzesTableCard: (props: {
    quizzes: QuizItem[];
    totalQuizzes?: number;
    page?: number;
    rowsPerPage?: number;
    onEdit: (quiz: QuizItem) => void;
    onCopyLink: (quiz: QuizItem) => Promise<void>;
    onTogglePublishStatus: (quiz: QuizItem) => Promise<void>;
    onDelete: (quiz: QuizItem) => Promise<void>;
    onOpenAnalytics: (quiz: QuizItem) => void;
    onStartSimulation: (quiz: QuizItem) => void;
  }) => (
    <div data-testid="table-card">
      <div>{`${props.quizzes.length}|${props.totalQuizzes ?? 0}|${props.page ?? 0}|${props.rowsPerPage ?? 0}`}</div>
      <button onClick={() => props.onEdit(props.quizzes[0]!)}>edit</button>
      <button onClick={() => void props.onCopyLink(props.quizzes[0]!)}>
        copy
      </button>
      <button
        onClick={() => void props.onTogglePublishStatus(props.quizzes[0]!)}
      >
        toggle
      </button>
      <button onClick={() => void props.onDelete(props.quizzes[0]!)}>
        delete
      </button>
      <button onClick={() => props.onOpenAnalytics(props.quizzes[0]!)}>
        analytics
      </button>
      <button onClick={() => props.onStartSimulation(props.quizzes[0]!)}>
        simulate
      </button>
    </div>
  ),
}));

vi.mock("../../../../src/pages/quizzes/components/QuizEditorDialog", () => ({
  QuizEditorDialog: (props: {
    title: string;
    saveLabel: string;
    groupOptions?: GroupItem[];
    questionBankLoading?: boolean;
    onClose: () => void;
    onSubmit: (payload: unknown) => void;
  }) => (
    <div data-testid="editor-dialog">
      <div>{props.title}</div>
      <div>{props.saveLabel}</div>
      <div>{props.groupOptions?.map((group) => group.name).join(",")}</div>
      <div>{String(props.questionBankLoading)}</div>
      <button onClick={props.onClose}>close</button>
      <button onClick={() => props.onSubmit({ payload: true })}>submit</button>
    </div>
  ),
}));

const quiz: QuizItem = {
  quizId: "quiz-1",
  title: "Quiz 1",
  description: "Desc",
  accessCode: "ABCD",
  requiresAccessCode: true,
  status: "draft",
  audienceScope: "all",
  assignedGroupIds: [],
  assignedGroups: [],
  hasAttempts: false,
  canEdit: true,
  canDelete: true,
  attemptsAllowed: 2,
  startAt: null,
  endAt: null,
  timeLimitMinutes: null,
  shuffleQuestions: false,
  revealAnswersAfterClose: false,
  publishedAt: null,
  totalQuestions: 1,
  totalPoints: 2,
  questions: [
    {
      questionId: "q-1",
      title: "Q1",
      type: "true_false",
      statement: "A",
      tags: [],
      points: 2,
      order: 1,
    },
  ],
  createdByUserId: 1,
  updatedByUserId: 1,
  version: 1,
  createdAt: "2026-04-12T10:00:00.000Z",
  updatedAt: "2026-04-12T10:00:00.000Z",
};

const questionBank: QuestionItem[] = [
  {
    questionId: "q-1",
    title: "Q1",
    type: "true_false",
    statement: "A",
    explanation: null,
    tags: [],
    createdByUserId: 1,
    updatedByUserId: 1,
    version: 1,
    questionConfig: { correctAnswer: true },
    createdAt: "2026-04-12T10:00:00.000Z",
    updatedAt: "2026-04-12T10:00:00.000Z",
  },
];

const groups: GroupItem[] = [
  {
    groupId: "group-1",
    name: "Grupo A",
    description: "",
    memberUserIds: [],
    members: [],
    memberCount: 0,
    createdByUserId: 1,
    updatedByUserId: 1,
    version: 1,
    createdAt: "2026-04-12T10:00:00.000Z",
    updatedAt: "2026-04-12T10:00:00.000Z",
  } as GroupItem,
];

function buildHookResult(
  overrides: Partial<ReturnType<typeof useQuizzesPage>> = {},
) {
  return {
    quizzes: [quiz],
    visibleQuizzes: [quiz],
    paginatedQuizzes: [quiz],
    questionBank,
    groups,
    loading: false,
    questionBankLoading: false,
    groupsLoading: false,
    submitting: false,
    feedback: null,
    search: "",
    statusFilter: "all" as const,
    editorOpen: false,
    editingQuiz: null,
    page: 0,
    rowsPerPage: 5,
    setSearch: vi.fn(),
    setStatusFilter: vi.fn(),
    setPage: vi.fn(),
    setRowsPerPage: vi.fn(),
    clearFeedback: vi.fn(),
    openCreateDialog: vi.fn(),
    openEditDialog: vi.fn(),
    closeEditor: vi.fn(),
    submitEditor: vi.fn(async () => undefined),
    togglePublishStatus: vi.fn(async () => undefined),
    copyAccessLink: vi.fn(async () => undefined),
    deleteQuiz: vi.fn(async () => undefined),
    refreshQuizzes: vi.fn(async () => undefined),
    ...overrides,
  } as ReturnType<typeof useQuizzesPage>;
}

describe("QuizzesPage", () => {
  it("renders header, filters and table and wires page actions", () => {
    const hook = buildHookResult({
      feedback: { severity: "success", message: "ok" },
    });
    vi.mocked(useQuizzesPage).mockReturnValue(hook);

    render(
      <MemoryRouter>
        <QuizzesPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("header-card")).toBeInTheDocument();
    expect(screen.getByText("ok")).toBeInTheDocument();
    expect(screen.getByTestId("filters-card")).toBeInTheDocument();
    expect(screen.getByTestId("table-card")).toBeInTheDocument();

    fireEvent.click(screen.getByText("refresh"));
    fireEvent.click(screen.getByText("create"));
    fireEvent.click(screen.getByText("search"));
    fireEvent.click(screen.getByText("status"));
    fireEvent.click(screen.getByText("edit"));
    fireEvent.click(screen.getByText("copy"));
    fireEvent.click(screen.getByText("toggle"));
    fireEvent.click(screen.getByText("delete"));
    fireEvent.click(screen.getByText("analytics"));
    fireEvent.click(screen.getByText("simulate"));

    expect(hook.refreshQuizzes).toHaveBeenCalledWith("quizzes.refreshSuccess");
    expect(hook.openCreateDialog).toHaveBeenCalledTimes(1);
    expect(hook.setSearch).toHaveBeenCalledWith("nuevo");
    expect(hook.setStatusFilter).toHaveBeenCalledWith("published");
    expect(hook.openEditDialog).toHaveBeenCalledWith(quiz);
    expect(hook.copyAccessLink).toHaveBeenCalledWith(quiz);
    expect(hook.togglePublishStatus).toHaveBeenCalledWith(quiz);
    expect(hook.deleteQuiz).toHaveBeenCalledWith(quiz);
    expect(mockNavigate).toHaveBeenCalledWith("/quizzes/quiz-1/analytics");
    expect(mockNavigate).toHaveBeenCalledWith("/quizzes/quiz-1/simulate");
  });

  it("renders editor dialog in edit mode and forwards dialog callbacks", () => {
    const hook = buildHookResult({ editorOpen: true, editingQuiz: quiz });
    vi.mocked(useQuizzesPage).mockReturnValue(hook);

    render(
      <MemoryRouter>
        <QuizzesPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("editor-dialog")).toHaveTextContent(
      "quizzes.dialogs.editTitle",
    );
    expect(screen.getByTestId("editor-dialog")).toHaveTextContent(
      "common.save",
    );

    fireEvent.click(screen.getByText("close"));
    fireEvent.click(screen.getByText("submit"));

    expect(hook.closeEditor).toHaveBeenCalledTimes(1);
    expect(hook.submitEditor).toHaveBeenCalledWith({ payload: true });
  });

  it("renders editor dialog in create mode with group options and combined loading state", () => {
    const hook = buildHookResult({
      editorOpen: true,
      editingQuiz: null,
      questionBankLoading: true,
      groupsLoading: true,
    });
    vi.mocked(useQuizzesPage).mockReturnValue(hook);

    render(
      <MemoryRouter>
        <QuizzesPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("editor-dialog")).toHaveTextContent(
      "quizzes.dialogs.createTitle",
    );
    expect(screen.getByTestId("editor-dialog")).toHaveTextContent(
      "common.create",
    );
    expect(screen.getByTestId("editor-dialog")).toHaveTextContent("Grupo A");
    expect(screen.getByTestId("editor-dialog")).toHaveTextContent("true");
  });
});
