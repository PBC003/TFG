import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuestionTrueFalseConfigSection } from "../../../../../src/components/questions/config/QuestionTrueFalseConfigSection";
import type { FormState } from "../../../../../src/components/questions/editor/question-editor.types";

vi.mock(
  "../../../../../src/components/questions/editor/QuestionTrueFalseEditor",
  () => ({
    QuestionTrueFalseEditor: (props: {
      onCorrectAnswerChange: (value: boolean) => void;
      onFeedbackForTrueChange: (value: string) => void;
      onFeedbackForFalseChange: (value: string) => void;
    }) => (
      <div>
        <button onClick={() => props.onCorrectAnswerChange(false)}>
          set-false
        </button>
        <button onClick={() => props.onFeedbackForTrueChange("bien")}>
          set-true-feedback
        </button>
        <button onClick={() => props.onFeedbackForFalseChange("mal")}>
          set-false-feedback
        </button>
      </div>
    ),
  }),
);

const baseForm: FormState = {
  title: "Pregunta",
  type: "true_false",
  statement: "Enunciado",
  explanation: "",
  tags: [],
  newTag: "",
  trueFalse: { correctAnswer: true, feedbackForTrue: "", feedbackForFalse: "" },
  singleChoice: {
    options: [
      { key: "a", text: "A", feedback: "", isCorrect: true },
      { key: "b", text: "B", feedback: "", isCorrect: false },
    ],
    randomizeOptions: false,
  },
  multipleChoice: {
    options: [
      { key: "a", text: "A", feedback: "", isCorrect: true },
      { key: "b", text: "B", feedback: "", isCorrect: false },
    ],
    randomizeOptions: false,
    gradingMode: "all_or_nothing",
  },
};

describe("QuestionTrueFalseConfigSection", () => {
  it("updates the true/false subsection through the editor callbacks", async () => {
    const user = userEvent.setup();
    let currentForm = structuredClone(baseForm);
    const onUpdateForm = vi.fn((updater: (current: FormState) => FormState) => {
      currentForm = updater(currentForm);
    });

    render(
      <QuestionTrueFalseConfigSection
        form={baseForm}
        latexFieldHelper="latex"
        isPreview={() => false}
        onTogglePreview={vi.fn()}
        onUpdateForm={onUpdateForm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "set-false" }));
    await user.click(screen.getByRole("button", { name: "set-true-feedback" }));
    await user.click(
      screen.getByRole("button", { name: "set-false-feedback" }),
    );

    expect(currentForm.trueFalse.correctAnswer).toBe(false);
    expect(currentForm.trueFalse.feedbackForTrue).toBe("bien");
    expect(currentForm.trueFalse.feedbackForFalse).toBe("mal");
  });
});
