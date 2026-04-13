import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizEditorDialogContent } from "../../../../../../src/pages/quizzes/components/quiz-editor/QuizEditorDialogContent";
import type { QuestionItem } from "../../../../../../src/types/question";
import type { QuizItem } from "../../../../../../src/types/quiz";

const mockUseQuizEditorDialog = vi.fn();

vi.mock(
  "../../../../../../src/pages/quizzes/hooks/useQuizEditorDialog",
  () => ({
    useQuizEditorDialog: (...args: unknown[]) =>
      mockUseQuizEditorDialog(...args),
  }),
);

vi.mock(
  "../../../../../../src/pages/quizzes/components/quiz-editor/QuizEditorBasicSettingsSection",
  () => ({
    QuizEditorBasicSettingsSection: (props: {
      onQuizTitleChange: (value: string) => void;
    }) => (
      <div data-testid="basic-settings">
        <button onClick={() => props.onQuizTitleChange("Nuevo")}>
          change-title
        </button>
      </div>
    ),
  }),
);

vi.mock(
  "../../../../../../src/pages/quizzes/components/quiz-editor/QuizEditorQuestionBankSection",
  () => ({
    QuizEditorQuestionBankSection: (props: {
      onSearchChange: (value: string) => void;
      onQuestionPageChange: (page: number) => void;
      onRowsPerPageChange: (rows: number) => void;
    }) => (
      <div data-testid="question-bank">
        <button onClick={() => props.onSearchChange("der")}>search</button>
        <button onClick={() => props.onQuestionPageChange(2)}>page</button>
        <button onClick={() => props.onRowsPerPageChange(10)}>rows</button>
      </div>
    ),
  }),
);

const questionBank: QuestionItem[] = [];
const quiz: QuizItem = {
  quizId: "quiz-1",
  title: "Quiz 1",
  description: null,
  accessCode: null,
  requiresAccessCode: false,
  status: "draft",
  hasAttempts: false,
  canEdit: true,
  canDelete: true,
  attemptsAllowed: 1,
  startAt: null,
  endAt: null,
  timeLimitMinutes: null,
  shuffleQuestions: false,
  revealAnswersAfterClose: false,
  publishedAt: null,
  totalQuestions: 0,
  totalPoints: 0,
  questions: [],
  createdByUserId: 1,
  updatedByUserId: 1,
  version: 1,
  createdAt: "2026-04-12T10:00:00.000Z",
  updatedAt: "2026-04-12T10:00:00.000Z",
};

const fields = {
  title: "title",
  description: "description",
  accessCode: "accessCode",
  accessCodeHelp: "help",
  accessCodePlaceholder: "placeholder",
  attemptsAllowed: "attempts",
  startAt: "startAt",
  startAtHelper: "startHelper",
  endAt: "endAt",
  endAtHelper: "endHelper",
  timeLimitMinutes: "timeLimit",
  shuffleQuestions: "shuffle",
  revealAnswersAfterClose: "reveal",
  selectedQuestionsCount: "count {{count}}",
  selectedQuestionsFirst: "selected first",
  questionPaginationLabel: "pagination",
  invalidDateRange: "invalid range",
  invalidEndDateInPast: "past",
};

describe("QuizEditorDialogContent", () => {
  it("renders warning, child sections and forwards submit/close actions", () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn(async () => undefined);
    const setSearch = vi.fn();
    const setQuestionPage = vi.fn();
    const setQuestionRowsPerPage = vi.fn();
    const setQuizTitle = vi.fn();
    const submit = vi.fn(async () => undefined);

    mockUseQuizEditorDialog.mockReturnValue({
      quizTitle: "Quiz",
      quizDescription: "Desc",
      accessCode: "ABCD",
      attemptsAllowed: "2",
      startAt: "2026-04-12T10:00",
      endAt: "2026-04-12T12:00",
      timeLimitMinutes: "30",
      shuffleQuestions: false,
      revealAnswersAfterClose: false,
      search: "",
      selectedQuestions: [],
      selectedQuestionMap: new Map(),
      localValidationMessage: "warning",
      questionPage: 0,
      questionRowsPerPage: 5,
      orderedQuestions: [],
      pagedQuestions: [],
      setQuizTitle,
      setQuizDescription: vi.fn(),
      setAccessCode: vi.fn(),
      setAttemptsAllowed: vi.fn(),
      setStartAt: vi.fn(),
      setEndAt: vi.fn(),
      setTimeLimitMinutes: vi.fn(),
      setShuffleQuestions: vi.fn(),
      setRevealAnswersAfterClose: vi.fn(),
      setSearch,
      setQuestionPage,
      setQuestionRowsPerPage,
      toggleQuestion: vi.fn(),
      updateQuestionPoints: vi.fn(),
      submit,
    });

    render(
      <QuizEditorDialogContent
        quiz={quiz}
        questionBank={questionBank}
        questionBankLoading={false}
        submitting={false}
        title="dialog title"
        description="dialog description"
        cancelLabel="cancel"
        saveLabel="save"
        searchPlaceholder="search"
        unsupportedTypeLabel="unsupported"
        questionsSectionTitle="questions"
        questionPointsLabel="points"
        noQuestionsLabel="empty"
        validationMessage="validation"
        fields={fields}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByText("dialog title")).toBeInTheDocument();
    expect(screen.getByText("dialog description")).toBeInTheDocument();
    expect(screen.getByText("warning")).toBeInTheDocument();
    expect(screen.getByTestId("basic-settings")).toBeInTheDocument();
    expect(screen.getByTestId("question-bank")).toBeInTheDocument();

    fireEvent.click(screen.getByText("change-title"));
    fireEvent.click(screen.getByText("search"));
    fireEvent.click(screen.getByText("page"));
    fireEvent.click(screen.getByText("rows"));
    fireEvent.click(screen.getByRole("button", { name: "cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "save" }));

    expect(setQuizTitle).toHaveBeenCalledWith("Nuevo");
    expect(setSearch).toHaveBeenCalledWith("der");
    expect(setQuestionPage).toHaveBeenNthCalledWith(1, 0);
    expect(setQuestionPage).toHaveBeenNthCalledWith(2, 2);
    expect(setQuestionRowsPerPage).toHaveBeenCalledWith(10);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(submit).toHaveBeenCalledTimes(1);
  });
});
