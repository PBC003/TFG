import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuestionTrueFalseEditor } from "../../../../../src/components/questions/editor/QuestionTrueFalseEditor";

vi.mock(
  "../../../../../src/components/questions/editor/QuestionMathField",
  () => ({
    QuestionMathField: ({
      fieldKey,
      onTogglePreview,
      onChange,
    }: {
      fieldKey: string;
      onTogglePreview: (fieldKey: string) => void;
      onChange: (value: string) => void;
    }) => (
      <div>
        <button onClick={() => onTogglePreview(fieldKey)}>
          toggle-{fieldKey}
        </button>
        <button onClick={() => onChange(`${fieldKey}-editado`)}>
          change-{fieldKey}
        </button>
      </div>
    ),
  }),
);

describe("QuestionTrueFalseEditor", () => {
  it("changes the correct answer and delegates feedback handlers", () => {
    const onCorrectAnswerChange = vi.fn();
    const onFeedbackForTrueChange = vi.fn();
    const onFeedbackForFalseChange = vi.fn();
    const onTogglePreview = vi.fn();

    render(
      <QuestionTrueFalseEditor
        correctAnswer
        feedbackForTrue="bien"
        feedbackForFalse="mal"
        onCorrectAnswerChange={onCorrectAnswerChange}
        onFeedbackForTrueChange={onFeedbackForTrueChange}
        onFeedbackForFalseChange={onFeedbackForFalseChange}
        answerLabel="Respuesta"
        trueLabel="Verdadero"
        falseLabel="Falso"
        optionFeedbackLabel="Feedback"
        latexFieldHelper="latex"
        isPreview={(fieldKey) => fieldKey === "feedbackForTrue"}
        onTogglePreview={onTogglePreview}
      />,
    );

    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Respuesta" }));
    fireEvent.click(screen.getByRole("option", { name: "Falso" }));
    fireEvent.click(
      screen.getByRole("button", { name: "toggle-feedbackForTrue" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "change-feedbackForTrue" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "change-feedbackForFalse" }),
    );

    expect(onCorrectAnswerChange).toHaveBeenCalledWith(false);
    expect(onTogglePreview).toHaveBeenCalledWith("feedbackForTrue");
    expect(onFeedbackForTrueChange).toHaveBeenCalledWith(
      "feedbackForTrue-editado",
    );
    expect(onFeedbackForFalseChange).toHaveBeenCalledWith(
      "feedbackForFalse-editado",
    );
  });
});
