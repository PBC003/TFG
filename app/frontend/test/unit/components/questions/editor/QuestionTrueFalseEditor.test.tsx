import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  it("changes the correct answer and delegates feedback handlers", async () => {
    const user = userEvent.setup();
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

    await user.click(screen.getByRole("combobox", { name: "Respuesta" }));
    await user.click(screen.getByRole("option", { name: "Falso" }));
    await user.click(
      screen.getByRole("button", { name: "toggle-feedbackForTrue" }),
    );
    await user.click(
      screen.getByRole("button", { name: "change-feedbackForTrue" }),
    );
    await user.click(
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
