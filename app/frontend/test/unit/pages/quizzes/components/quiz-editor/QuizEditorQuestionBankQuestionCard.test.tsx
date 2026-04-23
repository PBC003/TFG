import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizEditorQuestionBankQuestionCard } from "../../../../../../src/pages/quizzes/components/quiz-editor/QuizEditorQuestionBankQuestionCard";

describe("QuizEditorQuestionBankQuestionCard", () => {
  const baseQuestion = {
    questionId: "q-1",
    title: "Question 1",
    type: "parametric",
    statement: "x+1",
    explanation: "exp",
    tags: ["math"],
    createdByUserId: 1,
    createdAt: "2026-04-12T10:00:00.000Z",
    updatedAt: "2026-04-12T10:00:00.000Z",
    questionConfig: {
      templateId: "limit_trigonometric",
    },
  };

  it("renders controls for selected parametric questions and notifies updates", () => {
    const onToggleQuestion = vi.fn();
    const onUpdateQuestionPoints = vi.fn();
    const onUpdateQuestionQuantity = vi.fn();
    const onUpdateQuestionToleranceOverride = vi.fn();

    render(
      <QuizEditorQuestionBankQuestionCard
        question={baseQuestion as never}
        selectedQuestion={
          {
            questionId: "q-1",
            points: 2,
            quantity: 1,
            toleranceOverride: "0.5",
          } as never
        }
        submitting={false}
        questionPointsLabel="Points"
        cancelLabel="Remove"
        saveLabel="Add"
        fields={
          {
            parametricQuantity: "Quantity",
            parametricQuantityHelper: "Max: {{max}}",
            parametricToleranceOverride: "Tolerance",
            parametricToleranceOverrideHelper: "Optional tolerance",
          } as never
        }
        onToggleQuestion={onToggleQuestion}
        onUpdateQuestionPoints={onUpdateQuestionPoints}
        onUpdateQuestionQuantity={onUpdateQuestionQuantity}
        onUpdateQuestionToleranceOverride={onUpdateQuestionToleranceOverride}
      />,
    );

    fireEvent.change(screen.getByLabelText("Points"), {
      target: { value: "3" },
    });
    expect(onUpdateQuestionPoints).toHaveBeenCalledWith("q-1", "3");

    fireEvent.change(screen.getByLabelText("Quantity"), {
      target: { value: "2" },
    });
    expect(onUpdateQuestionQuantity).toHaveBeenCalledWith("q-1", "2");

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(onToggleQuestion).toHaveBeenCalledWith(baseQuestion);
  });
});
