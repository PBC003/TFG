import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizEditorQuestionBankSection } from "../../../../../../src/pages/quizzes/components/quiz-editor/QuizEditorQuestionBankSection";
import type { QuestionItem } from "../../../../../../src/types/question";
import type { QuizEditorDialogProps } from "../../../../../../src/pages/quizzes/components/quiz-editor/quiz-editor-dialog.types";
import { renderWithProviders } from "../../../../../utils/render";

vi.mock("../../../../../../src/components/math/MathText", () => ({
  MathText: ({ value }: { value: string | null }) => <span>{value}</span>,
}));

const fields: QuizEditorDialogProps["fields"] = {
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

const baseQuestion: QuestionItem = {
  questionId: "q-1",
  title: "Question 1",
  type: "single_choice",
  statement: "Statement 1",
  explanation: null,
  tags: ["tag-a"],
  createdByUserId: 1,
  updatedByUserId: 1,
  version: 1,
  questionConfig: {
    options: [
      { key: "a", text: "A" },
      { key: "b", text: "B" },
    ],
    correctOptionKey: "a",
  },
  createdAt: "2026-04-12T10:00:00.000Z",
  updatedAt: "2026-04-12T10:00:00.000Z",
};

describe("QuizEditorQuestionBankSection", () => {
  it("renders loading and empty states", () => {
    const { rerender } = renderWithProviders(
      <QuizEditorQuestionBankSection
        submitting={false}
        loading
        searchPlaceholder="search"
        unsupportedTypeLabel="unsupported"
        questionsSectionTitle="questions"
        questionPointsLabel="points"
        noQuestionsLabel="empty"
        loadingLabel="loading"
        cancelLabel="cancel"
        saveLabel="save"
        fields={fields}
        search=""
        selectedQuestions={[]}
        selectedQuestionMap={new Map()}
        orderedQuestions={[]}
        pagedQuestions={[]}
        questionPage={0}
        questionRowsPerPage={5}
        onSearchChange={vi.fn()}
        onQuestionPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
        onToggleQuestion={vi.fn()}
        onUpdateQuestionPoints={vi.fn()}
      />,
    );

    expect(screen.getByText("loading")).toBeInTheDocument();

    rerender(
      <QuizEditorQuestionBankSection
        submitting={false}
        loading={false}
        searchPlaceholder="search"
        unsupportedTypeLabel="unsupported"
        questionsSectionTitle="questions"
        questionPointsLabel="points"
        noQuestionsLabel="empty"
        loadingLabel="loading"
        cancelLabel="cancel"
        saveLabel="save"
        fields={fields}
        search=""
        selectedQuestions={[]}
        selectedQuestionMap={new Map()}
        orderedQuestions={[]}
        pagedQuestions={[]}
        questionPage={0}
        questionRowsPerPage={5}
        onSearchChange={vi.fn()}
        onQuestionPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
        onToggleQuestion={vi.fn()}
        onUpdateQuestionPoints={vi.fn()}
      />,
    );

    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("renders selected and unsupported questions and delegates callbacks", () => {
    const onSearchChange = vi.fn();
    const onQuestionPageChange = vi.fn();
    const onRowsPerPageChange = vi.fn();
    const onToggleQuestion = vi.fn();
    const onUpdateQuestionPoints = vi.fn();

    const parametricQuestion: QuestionItem = {
      ...baseQuestion,
      questionId: "q-2",
      title: "Question 2",
      type: "parametric",
      statement: "Statement 2",
      questionConfig: {
        variables: [],
        answerFormula: "x",
      },
    };

    renderWithProviders(
      <QuizEditorQuestionBankSection
        submitting={false}
        loading={false}
        searchPlaceholder="search"
        unsupportedTypeLabel="unsupported"
        questionsSectionTitle="questions"
        questionPointsLabel="points"
        noQuestionsLabel="empty"
        loadingLabel="loading"
        cancelLabel="cancel"
        saveLabel="save"
        fields={fields}
        search="calc"
        selectedQuestions={[{ questionId: "q-1", points: 3 }]}
        selectedQuestionMap={
          new Map([["q-1", { questionId: "q-1", points: 3 }]])
        }
        orderedQuestions={[baseQuestion, parametricQuestion]}
        pagedQuestions={[baseQuestion, parametricQuestion]}
        questionPage={0}
        questionRowsPerPage={5}
        onSearchChange={onSearchChange}
        onQuestionPageChange={onQuestionPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        onToggleQuestion={onToggleQuestion}
        onUpdateQuestionPoints={onUpdateQuestionPoints}
      />,
    );

    fireEvent.change(screen.getByLabelText("search"), {
      target: { value: "nuevo" },
    });

    const questionOneHeading = screen.getByRole("heading", {
      name: "Question 1",
    });
    const questionOneItem = questionOneHeading.closest("li");
    expect(questionOneItem).not.toBeNull();

    const questionOneWithin = within(questionOneItem as HTMLElement);
    fireEvent.click(questionOneWithin.getAllByRole("checkbox")[0]);
    fireEvent.change(
      questionOneWithin.getByRole("spinbutton", { name: "points" }),
      {
        target: { value: "4" },
      },
    );
    fireEvent.click(questionOneWithin.getByRole("button", { name: "cancel" }));

    expect(screen.getByText("unsupported")).toBeInTheDocument();
    expect(screen.getByText("Statement 1")).toBeInTheDocument();
    expect(onSearchChange).toHaveBeenCalledWith("nuevo");
    expect(onToggleQuestion).toHaveBeenCalledWith(baseQuestion);
    expect(onUpdateQuestionPoints).toHaveBeenCalledWith("q-1", "4");
    expect(onQuestionPageChange).not.toHaveBeenCalled();
    expect(onRowsPerPageChange).not.toHaveBeenCalled();
  });
});
