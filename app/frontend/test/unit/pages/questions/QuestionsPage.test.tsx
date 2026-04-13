import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import QuestionsPage from "../../../../src/pages/questions/QuestionsPage";
import type { QuestionItem } from "../../../../src/types/question";
import { useQuestionsPage } from "../../../../src/pages/questions/hooks/useQuestionsPage";

vi.mock("@mui/material", async () => {
  const actual =
    await vi.importActual<typeof import("@mui/material")>("@mui/material");
  return {
    ...actual,
    useMediaQuery: vi.fn(() => false),
  };
});

vi.mock("@mui/material/styles", async () => {
  const actual = await vi.importActual<typeof import("@mui/material/styles")>(
    "@mui/material/styles",
  );
  return {
    ...actual,
    useTheme: vi.fn(() => ({
      breakpoints: { down: () => "(max-width: 900px)" },
    })),
  };
});

vi.mock("../../../../src/pages/questions/hooks/useQuestionsPage", () => ({
  useQuestionsPage: vi.fn(),
}));

vi.mock(
  "../../../../src/components/questions/list/QuestionsHeaderCard",
  () => ({
    QuestionsHeaderCard: ({
      title,
      subtitle,
      refreshLabel,
      createLabel,
      loading,
      submitting,
      onRefresh,
      onCreate,
    }: {
      title: string;
      subtitle: string;
      refreshLabel: string;
      createLabel: string;
      loading: boolean;
      submitting: boolean;
      onRefresh: () => void;
      onCreate: () => void;
    }) => (
      <div>
        <div>{title}</div>
        <div>{subtitle}</div>
        <div>{`${loading}-${submitting}`}</div>
        <button onClick={onRefresh}>{refreshLabel}</button>
        <button onClick={onCreate}>{createLabel}</button>
      </div>
    ),
  }),
);

vi.mock(
  "../../../../src/components/questions/list/QuestionsFiltersCard",
  () => ({
    QuestionsFiltersCard: ({
      searchLabel,
      searchValue,
      onSearchChange,
      typeFilterLabel,
      typeFilterValue,
      onTypeFilterChange,
      typeFilters,
      getTypeLabel,
      totalVisibleText,
    }: {
      searchLabel: string;
      searchValue: string;
      onSearchChange: (value: string) => void;
      typeFilterLabel: string;
      typeFilterValue: string;
      onTypeFilterChange: (
        value:
          | "all"
          | "true_false"
          | "single_choice"
          | "multiple_choice"
          | "parametric",
      ) => void;
      typeFilters: Array<
        | "all"
        | "true_false"
        | "single_choice"
        | "multiple_choice"
        | "parametric"
      >;
      getTypeLabel: (
        value:
          | "all"
          | "true_false"
          | "single_choice"
          | "multiple_choice"
          | "parametric",
      ) => string;
      totalVisibleText: string;
    }) => (
      <div data-testid="filters">
        <div>{searchLabel}</div>
        <div>{searchValue}</div>
        <div>{typeFilterLabel}</div>
        <div>{typeFilterValue}</div>
        <div>{typeFilters.map((value) => getTypeLabel(value)).join("|")}</div>
        <div>{totalVisibleText}</div>
        <button onClick={() => onSearchChange("integrales")}>set-search</button>
        <button onClick={() => onTypeFilterChange("multiple_choice")}>
          set-type-filter
        </button>
      </div>
    ),
  }),
);

vi.mock(
  "../../../../src/pages/questions/components/QuestionsPageContent",
  () => ({
    QuestionsPageContent: ({
      loading,
      isMobile,
      questions,
      locale,
      noneLabel,
      loadingLabel,
      emptyLabel,
      editLabel,
      deleteLabel,
      tableHeaders,
      lastUpdatedLabel,
      page,
      rowsPerPage,
      totalQuestions,
      rowsPerPageLabel,
      displayedRowsLabel,
      onPageChange,
      onRowsPerPageChange,
      onEdit,
      onDelete,
    }: {
      loading: boolean;
      isMobile: boolean;
      questions: QuestionItem[];
      locale: string;
      noneLabel: string;
      loadingLabel: string;
      emptyLabel: string;
      editLabel: string;
      deleteLabel: string;
      tableHeaders: {
        title: string;
        type: string;
        tags: string;
        version: string;
        updatedAt: string;
        actions: string;
      };
      lastUpdatedLabel: (value: string) => string;
      page: number;
      rowsPerPage: number;
      totalQuestions: number;
      rowsPerPageLabel: string;
      displayedRowsLabel: (from: number, to: number, count: number) => string;
      onPageChange: (page: number) => void;
      onRowsPerPageChange: (value: number) => void;
      onEdit: (q: QuestionItem) => void;
      onDelete: (q: QuestionItem) => void;
    }) => (
      <div>
        <div data-testid="content-flags">{`${loading}-${isMobile}-${locale}`}</div>
        <div data-testid="content-labels">{`${noneLabel}|${loadingLabel}|${emptyLabel}|${editLabel}|${deleteLabel}`}</div>
        <div data-testid="table-headers">
          {Object.values(tableHeaders).join("|")}
        </div>
        <div data-testid="content">
          {questions.length > 0
            ? questions.map((q) => q.questionId).join(",")
            : "empty-list"}
        </div>
        <div data-testid="pagination-props">{`${page}|${rowsPerPage}|${totalQuestions}|${rowsPerPageLabel}|${displayedRowsLabel(1, Math.max(1, questions.length), totalQuestions)}`}</div>
        <button onClick={() => onPageChange(page + 1)}>next-page</button>
        <button onClick={() => onRowsPerPageChange(25)}>rows-per-page</button>
        {questions.length > 0 ? (
          <div data-testid="last-updated">
            {lastUpdatedLabel(questions[0]!.updatedAt)}
          </div>
        ) : null}
        <button onClick={() => questions[0] && onEdit(questions[0])}>
          edit
        </button>
        <button onClick={() => questions[0] && onDelete(questions[0])}>
          delete
        </button>
      </div>
    ),
  }),
);

vi.mock(
  "../../../../src/components/questions/editor/QuestionEditorDialog",
  () => ({
    QuestionEditorDialog: ({
      question,
      open,
      submitting,
      onClose,
      onSubmit,
    }: {
      question: QuestionItem | null;
      open: boolean;
      submitting: boolean;
      onClose: () => void;
      onSubmit: () => Promise<void>;
    }) => (
      <div>
        <div data-testid="editor">{question?.questionId ?? "new"}</div>
        <div data-testid="editor-state">{`${open}-${submitting}`}</div>
        <button onClick={onClose}>editor-close</button>
        <button onClick={() => void onSubmit()}>editor-submit</button>
      </div>
    ),
  }),
);

vi.mock(
  "../../../../src/components/questions/dialogs/DeleteQuestionDialog",
  () => ({
    DeleteQuestionDialog: ({
      question,
      open,
      submitting,
      title,
      description,
      cancelLabel,
      confirmLabel,
      onClose,
      onConfirm,
    }: {
      question: QuestionItem | null;
      open: boolean;
      submitting: boolean;
      title: string;
      description: string;
      cancelLabel: string;
      confirmLabel: string;
      onClose: () => void;
      onConfirm: () => void;
    }) => (
      <div>
        <div data-testid="delete-open">{String(open)}</div>
        <div data-testid="delete-question">
          {question?.questionId ?? "none"}
        </div>
        <div data-testid="delete-labels">{`${title}|${description}|${cancelLabel}|${confirmLabel}|${submitting}`}</div>
        <button onClick={onClose}>delete-close</button>
        <button onClick={onConfirm}>delete-confirm</button>
      </div>
    ),
  }),
);

const question: QuestionItem = {
  questionId: "q-1",
  title: "Integral",
  type: "true_false",
  statement: "\\int x dx",
  explanation: null,
  tags: ["integrales"],
  createdByUserId: 1,
  updatedByUserId: 1,
  version: 1,
  questionConfig: { correctAnswer: true },
  createdAt: "2026-03-30T10:00:00.000Z",
  updatedAt: "2026-03-30T10:00:00.000Z",
};

describe("QuestionsPage", () => {
  const refreshQuestions = vi.fn(async () => undefined);
  const openCreateDialog = vi.fn();
  const openEditDialog = vi.fn();
  const closeEditor = vi.fn();
  const submitEditor = vi.fn(async () => undefined);
  const openDeleteDialog = vi.fn();
  const closeDeleteDialog = vi.fn();
  const confirmDelete = vi.fn(async () => undefined);
  const clearFeedback = vi.fn();
  const setSearch = vi.fn();
  const setTypeFilter = vi.fn();
  const setPage = vi.fn();
  const setRowsPerPage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQuestionsPage).mockReturnValue({
      questions: [question],
      visibleQuestions: [question],
      paginatedQuestions: [question],
      loading: false,
      submitting: false,
      feedback: { severity: "success", message: "ok" },
      search: "",
      typeFilter: "all",
      editorOpen: true,
      editingQuestion: question,
      deletingQuestion: question,
      page: 0,
      rowsPerPage: 10,
      setSearch,
      setTypeFilter,
      setPage,
      setRowsPerPage,
      clearFeedback,
      openCreateDialog,
      openEditDialog,
      closeEditor,
      submitEditor,
      openDeleteDialog,
      closeDeleteDialog,
      confirmDelete,
      refreshQuestions,
    });
  });

  it("wires the page state to the header, filters, content and dialogs", async () => {
    const user = userEvent.setup();
    render(<QuestionsPage />);

    expect(screen.getByTestId("filters")).toHaveTextContent(
      "questions.searchPlaceholder",
    );
    expect(screen.getByTestId("filters")).toHaveTextContent(
      "common.all|questions.types.true_false|questions.types.single_choice|questions.types.multiple_choice|questions.types.parametric",
    );
    expect(screen.getByTestId("filters")).toHaveTextContent(
      "questions.totalVisible",
    );
    expect(screen.getByText("ok")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toHaveTextContent("q-1");
    expect(screen.getByTestId("pagination-props")).toHaveTextContent(
      "0|10|1|questions.pagination.rowsPerPage|questions.pagination.displayedRows",
    );
    expect(screen.getByTestId("last-updated")).toHaveTextContent(
      "questions.lastUpdated",
    );
    expect(screen.getByTestId("editor")).toHaveTextContent("q-1");
    expect(screen.getByTestId("delete-open")).toHaveTextContent("true");
    expect(screen.getByTestId("delete-question")).toHaveTextContent("q-1");

    await user.click(screen.getByRole("button", { name: "common.refresh" }));
    expect(refreshQuestions).toHaveBeenCalledWith("questions.refreshSuccess");

    await user.click(
      screen.getByRole("button", { name: "questions.createAction" }),
    );
    expect(openCreateDialog).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "set-search" }));
    expect(setSearch).toHaveBeenCalledWith("integrales");

    await user.click(screen.getByRole("button", { name: "set-type-filter" }));
    expect(setTypeFilter).toHaveBeenCalledWith("multiple_choice");

    await user.click(screen.getByRole("button", { name: "next-page" }));
    expect(setPage).toHaveBeenCalledWith(1);

    await user.click(screen.getByRole("button", { name: "rows-per-page" }));
    expect(setRowsPerPage).toHaveBeenCalledWith(25);

    await user.click(screen.getByRole("button", { name: "edit" }));
    expect(openEditDialog).toHaveBeenCalledWith(question);

    await user.click(screen.getByRole("button", { name: "delete" }));
    expect(openDeleteDialog).toHaveBeenCalledWith(question);

    await user.click(screen.getByRole("button", { name: "editor-close" }));
    expect(closeEditor).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "editor-submit" }));
    expect(submitEditor).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "delete-close" }));
    expect(closeDeleteDialog).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "delete-confirm" }));
    expect(confirmDelete).toHaveBeenCalled();
  });

  it("hides the feedback and editor when they are not active and still renders the delete dialog closed", () => {
    vi.mocked(useQuestionsPage).mockReturnValue({
      questions: [question],
      visibleQuestions: [],
      paginatedQuestions: [],
      loading: true,
      submitting: true,
      feedback: null,
      search: "abc",
      typeFilter: "true_false",
      editorOpen: false,
      editingQuestion: null,
      deletingQuestion: null,
      page: 0,
      rowsPerPage: 10,
      setSearch,
      setTypeFilter,
      setPage,
      setRowsPerPage,
      clearFeedback,
      openCreateDialog,
      openEditDialog,
      closeEditor,
      submitEditor,
      openDeleteDialog,
      closeDeleteDialog,
      confirmDelete,
      refreshQuestions,
    });

    render(<QuestionsPage />);

    expect(screen.queryByText("ok")).not.toBeInTheDocument();
    expect(screen.queryByTestId("editor")).not.toBeInTheDocument();
    expect(screen.getByTestId("content")).toHaveTextContent("empty-list");
    expect(screen.getByTestId("delete-open")).toHaveTextContent("false");
    expect(screen.getByTestId("delete-question")).toHaveTextContent("none");
    expect(screen.getByTestId("filters")).toHaveTextContent("abc");
    expect(screen.getByTestId("filters")).toHaveTextContent("true_false");
  });
});
