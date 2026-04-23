import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_PARAMETRIC_TOLERANCE } from "../../../../../../src/utils/parametric-question.utils";
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
  parametricQuantity: "quantity",
  parametricQuantityHelper: "max {{max}}",
  parametricToleranceOverride: "tolerance",
  parametricToleranceOverrideHelper: "tol helper",
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
        onUpdateQuestionQuantity={vi.fn()}
        onUpdateQuestionToleranceOverride={vi.fn()}
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
        onUpdateQuestionQuantity={vi.fn()}
        onUpdateQuestionToleranceOverride={vi.fn()}
      />,
    );

    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("renders selected questions and delegates callbacks for supported parametric items too", () => {
    const onSearchChange = vi.fn();
    const onQuestionPageChange = vi.fn();
    const onRowsPerPageChange = vi.fn();
    const onToggleQuestion = vi.fn();
    const onUpdateQuestionPoints = vi.fn();
    const onUpdateQuestionQuantity = vi.fn();
    const onUpdateQuestionToleranceOverride = vi.fn();

    const parametricQuestion: QuestionItem = {
      ...baseQuestion,
      questionId: "q-2",
      title: "Question 2",
      type: "parametric",
      statement: "Statement 2",
      questionConfig: {
        templateId: "series_geometric",
        tolerance: 0.01,
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
        selectedQuestions={[
          { questionId: "q-1", points: 3 },
          {
            questionId: "q-2",
            type: "parametric",
            points: 2,
            quantity: 3,
            toleranceOverride: "0.2",
          },
        ]}
        selectedQuestionMap={
          new Map([
            ["q-1", { questionId: "q-1", points: 3 }],
            [
              "q-2",
              {
                questionId: "q-2",
                type: "parametric",
                points: 2,
                quantity: 3,
                toleranceOverride: "0.2",
              },
            ],
          ])
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
        onUpdateQuestionQuantity={onUpdateQuestionQuantity}
        onUpdateQuestionToleranceOverride={onUpdateQuestionToleranceOverride}
      />,
    );

    expect(screen.getByText("count 4")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("search"), {
      target: { value: "nuevo" },
    });

    const questionOneItem = screen
      .getByRole("heading", { name: "Question 1" })
      .closest("li");
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

    const questionTwoItem = screen
      .getByRole("heading", { name: "Question 2" })
      .closest("li");
    expect(questionTwoItem).not.toBeNull();

    const questionTwoWithin = within(questionTwoItem as HTMLElement);
    expect(questionTwoWithin.getByText("parametric")).toBeInTheDocument();
    expect(questionTwoWithin.getByText("max 24")).toBeInTheDocument();

    fireEvent.change(
      questionTwoWithin.getByRole("spinbutton", { name: "points" }),
      {
        target: { value: "5" },
      },
    );
    fireEvent.change(
      questionTwoWithin.getByRole("spinbutton", { name: "quantity" }),
      {
        target: { value: "4" },
      },
    );
    fireEvent.change(
      questionTwoWithin.getByRole("textbox", { name: "tolerance" }),
      {
        target: { value: "0.5" },
      },
    );
    fireEvent.blur(
      questionTwoWithin.getByRole("textbox", { name: "tolerance" }),
    );
    fireEvent.change(
      questionTwoWithin.getByRole("textbox", { name: "tolerance" }),
      {
        target: { value: "   " },
      },
    );
    fireEvent.blur(
      questionTwoWithin.getByRole("textbox", { name: "tolerance" }),
    );
    fireEvent.click(questionTwoWithin.getByRole("button", { name: "cancel" }));

    expect(screen.getByText("Statement 1")).toBeInTheDocument();
    expect(screen.getByText("Statement 2")).toBeInTheDocument();
    expect(onSearchChange).toHaveBeenCalledWith("nuevo");
    expect(onToggleQuestion).toHaveBeenCalledWith(baseQuestion);
    expect(onToggleQuestion).toHaveBeenCalledWith(parametricQuestion);
    expect(onUpdateQuestionPoints).toHaveBeenCalledWith("q-1", "4");
    expect(onUpdateQuestionPoints).toHaveBeenCalledWith("q-2", "5");
    expect(onUpdateQuestionQuantity).toHaveBeenCalledWith("q-2", "4");
    expect(onUpdateQuestionToleranceOverride).toHaveBeenCalledWith(
      "q-2",
      "0.5",
    );
    expect(onQuestionPageChange).not.toHaveBeenCalled();
    expect(onRowsPerPageChange).not.toHaveBeenCalled();
  }, 10000);

  it("restores the default parametric tolerance when the field loses focus empty", () => {
    const onUpdateQuestionToleranceOverride = vi.fn();

    const parametricQuestion: QuestionItem = {
      ...baseQuestion,
      questionId: "q-2",
      title: "Question 2",
      type: "parametric",
      statement: "Statement 2",
      questionConfig: {
        templateId: "series_geometric",
        tolerance: 0.01,
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
        search=""
        selectedQuestions={[
          {
            questionId: "q-2",
            type: "parametric",
            points: 2,
            quantity: 1,
            toleranceOverride: "",
          },
        ]}
        selectedQuestionMap={
          new Map([
            [
              "q-2",
              {
                questionId: "q-2",
                type: "parametric",
                points: 2,
                quantity: 1,
                toleranceOverride: "",
              },
            ],
          ])
        }
        orderedQuestions={[parametricQuestion]}
        pagedQuestions={[parametricQuestion]}
        questionPage={0}
        questionRowsPerPage={5}
        onSearchChange={vi.fn()}
        onQuestionPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
        onToggleQuestion={vi.fn()}
        onUpdateQuestionPoints={vi.fn()}
        onUpdateQuestionQuantity={vi.fn()}
        onUpdateQuestionToleranceOverride={onUpdateQuestionToleranceOverride}
      />,
    );

    fireEvent.blur(screen.getByRole("textbox", { name: "tolerance" }));

    expect(onUpdateQuestionToleranceOverride).toHaveBeenCalledWith(
      "q-2",
      String(DEFAULT_PARAMETRIC_TOLERANCE),
    );
  });

  it("delegates pagination changes and disables editing controls while submitting", () => {
    const onQuestionPageChange = vi.fn();
    const onRowsPerPageChange = vi.fn();

    renderWithProviders(
      <QuizEditorQuestionBankSection
        submitting
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
        selectedQuestions={[{ questionId: "q-1", points: 3 }]}
        selectedQuestionMap={
          new Map([["q-1", { questionId: "q-1", points: 3 }]])
        }
        orderedQuestions={Array.from({ length: 6 }, (_, index) => ({
          ...baseQuestion,
          questionId: `q-${index + 1}`,
          title: `Question ${index + 1}`,
        }))}
        pagedQuestions={[baseQuestion]}
        questionPage={0}
        questionRowsPerPage={5}
        onSearchChange={vi.fn()}
        onQuestionPageChange={onQuestionPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        onToggleQuestion={vi.fn()}
        onUpdateQuestionPoints={vi.fn()}
        onUpdateQuestionQuantity={vi.fn()}
        onUpdateQuestionToleranceOverride={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("search")).toBeDisabled();
    expect(screen.getByRole("checkbox")).toBeDisabled();
    expect(screen.getByRole("spinbutton", { name: "points" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "cancel" })).toBeDisabled();

    fireEvent.click(screen.getByLabelText("Go to next page"));
    const rowsSelect = screen.getByRole("combobox", { name: "pagination" });
    fireEvent.mouseDown(rowsSelect);
    fireEvent.click(screen.getByRole("option", { name: "10" }));

    expect(onQuestionPageChange).toHaveBeenCalledWith(1);
    expect(onRowsPerPageChange).toHaveBeenCalledWith(10);
  });

  it("uses fallback labels and save action for unselected parametric questions", () => {
    const onToggleQuestion = vi.fn();
    const parametricQuestion: QuestionItem = {
      ...baseQuestion,
      questionId: "q-fallback",
      title: "Fallback parametric",
      type: "parametric",
      questionConfig: {
        templateId: "series_geometric",
        tolerance: 0.01,
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
        fields={{
          ...fields,
          parametricQuantity: undefined,
          parametricQuantityHelper: undefined,
          parametricToleranceOverride: undefined,
          parametricToleranceOverrideHelper: undefined,
        }}
        search=""
        selectedQuestions={[]}
        selectedQuestionMap={new Map()}
        orderedQuestions={[parametricQuestion]}
        pagedQuestions={[parametricQuestion]}
        questionPage={0}
        questionRowsPerPage={5}
        onSearchChange={vi.fn()}
        onQuestionPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
        onToggleQuestion={onToggleQuestion}
        onUpdateQuestionPoints={vi.fn()}
        onUpdateQuestionQuantity={vi.fn()}
        onUpdateQuestionToleranceOverride={vi.fn()}
      />,
    );

    expect(screen.getByText("count 0")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "save" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "save" }));
    expect(onToggleQuestion).toHaveBeenCalledWith(parametricQuestion);
    expect(
      screen.queryByRole("spinbutton", { name: "Cantidad" }),
    ).not.toBeInTheDocument();
  });

  it("renders fallback parametric controls for selected questions when field labels are missing", () => {
    const parametricQuestion: QuestionItem = {
      ...baseQuestion,
      questionId: "q-selected-fallback",
      title: "Selected fallback parametric",
      type: "parametric",
      questionConfig: {
        templateId: "series_geometric",
        tolerance: 0.01,
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
        fields={{
          ...fields,
          parametricQuantity: undefined,
          parametricQuantityHelper: undefined,
          parametricToleranceOverride: undefined,
          parametricToleranceOverrideHelper: undefined,
        }}
        search=""
        selectedQuestions={[
          {
            questionId: "q-selected-fallback",
            type: "parametric",
            points: 2,
            quantity: 1,
            toleranceOverride: "0.1",
          },
        ]}
        selectedQuestionMap={
          new Map([
            [
              "q-selected-fallback",
              {
                questionId: "q-selected-fallback",
                type: "parametric",
                points: 2,
                quantity: 1,
                toleranceOverride: "0.1",
              },
            ],
          ])
        }
        orderedQuestions={[parametricQuestion]}
        pagedQuestions={[parametricQuestion]}
        questionPage={0}
        questionRowsPerPage={5}
        onSearchChange={vi.fn()}
        onQuestionPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
        onToggleQuestion={vi.fn()}
        onUpdateQuestionPoints={vi.fn()}
        onUpdateQuestionQuantity={vi.fn()}
        onUpdateQuestionToleranceOverride={vi.fn()}
      />,
    );

    expect(screen.getByRole("spinbutton", { name: "Cantidad" })).toHaveValue(1);
    expect(screen.getByRole("textbox", { name: "Tolerancia" })).toHaveValue(
      "0.1",
    );
    expect(screen.getByText("Máximo disponible: 24.")).toBeInTheDocument();
  });
});
