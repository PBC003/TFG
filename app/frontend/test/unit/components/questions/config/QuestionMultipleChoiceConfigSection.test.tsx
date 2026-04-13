import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuestionMultipleChoiceConfigSection } from "../../../../../src/components/questions/config/QuestionMultipleChoiceConfigSection";
import type { FormState } from "../../../../../src/components/questions/editor/question-editor.types";

vi.mock(
  "../../../../../src/components/questions/editor/QuestionChoiceOptionsEditor",
  () => ({
    QuestionChoiceOptionsEditor: (props: {
      deleteLabel: string;
      correctLabel: string;
      optionTextLabel: string;
      optionFeedbackLabel: string;
      addOptionLabel: string;
      canSelectMultipleCorrect: boolean;
      optionLabel: (index: number) => string;
      isOptionPreview: (fieldKey: string) => boolean;
      onToggleCorrect: (index: number, checked: boolean) => void;
      onChangeOptionField: (
        index: number,
        field: "text" | "feedback" | "isCorrect",
        value: string | boolean,
      ) => void;
      onRemoveOption: (index: number) => void;
      onAddOption: () => void;
      onTogglePreview: (fieldKey: string) => void;
    }) => (
      <div>
        <div>{props.deleteLabel}</div>
        <div>{props.correctLabel}</div>
        <div>{props.optionTextLabel}</div>
        <div>{props.optionFeedbackLabel}</div>
        <div>{props.addOptionLabel}</div>
        <div>{props.optionLabel(0)}</div>
        <div>{String(props.canSelectMultipleCorrect)}</div>
        <div>{String(props.isOptionPreview("options.0.text"))}</div>
        <button onClick={() => props.onToggleCorrect(0, false)}>
          toggle-correct
        </button>
        <button onClick={() => props.onChangeOptionField(0, "text", "editada")}>
          change-field
        </button>
        <button onClick={props.onAddOption}>add-option</button>
        <button onClick={() => props.onRemoveOption(0)}>remove-option</button>
        <button onClick={() => props.onTogglePreview("options.0.text")}>
          preview-option
        </button>
      </div>
    ),
  }),
);

const baseForm: FormState = {
  title: "Pregunta",
  type: "multiple_choice",
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

describe("QuestionMultipleChoiceConfigSection", () => {
  it("updates multiple-choice settings and delegates all child callbacks with prefixed preview keys", () => {
    let currentForm = structuredClone(baseForm);
    const onUpdateForm = vi.fn((updater: (current: FormState) => FormState) => {
      currentForm = updater(currentForm);
    });
    const onUpdateMultipleChoiceOption = vi.fn();
    const onAddMultipleChoiceOption = vi.fn();
    const onRemoveMultipleChoiceOption = vi.fn();
    const onTogglePreview = vi.fn();
    const isPreview = vi.fn(
      (fieldKey: string) => fieldKey === "multipleChoice.options.0.text",
    );

    render(
      <QuestionMultipleChoiceConfigSection
        form={baseForm}
        latexFieldHelper="latex"
        isPreview={isPreview}
        onTogglePreview={onTogglePreview}
        onUpdateForm={onUpdateForm}
        onUpdateMultipleChoiceOption={onUpdateMultipleChoiceOption}
        onAddMultipleChoiceOption={onAddMultipleChoiceOption}
        onRemoveMultipleChoiceOption={onRemoveMultipleChoiceOption}
      />,
    );

    expect(
      screen.getByText("questions.fields.optionIsCorrect"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("questions.fields.optionLabel"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("true")).toHaveLength(2);

    fireEvent.click(
      screen.getByRole("switch", { name: "questions.fields.randomizeOptions" }),
    );

    const gradingMode = screen.getByRole("combobox", {
      name: "questions.fields.gradingMode",
    });
    fireEvent.mouseDown(gradingMode);
    const listbox = screen.getByRole("listbox");
    fireEvent.click(
      within(listbox).getByText("questions.gradingModes.partial_credit"),
    );

    fireEvent.click(screen.getByRole("button", { name: "toggle-correct" }));
    fireEvent.click(screen.getByRole("button", { name: "change-field" }));
    fireEvent.click(screen.getByRole("button", { name: "add-option" }));
    fireEvent.click(screen.getByRole("button", { name: "remove-option" }));
    fireEvent.click(screen.getByRole("button", { name: "preview-option" }));

    expect(currentForm.multipleChoice.randomizeOptions).toBe(true);
    expect(currentForm.multipleChoice.gradingMode).toBe("partial_credit");
    expect(isPreview).toHaveBeenCalledWith("multipleChoice.options.0.text");
    expect(onUpdateMultipleChoiceOption).toHaveBeenCalledWith(
      0,
      "isCorrect",
      false,
    );
    expect(onUpdateMultipleChoiceOption).toHaveBeenCalledWith(
      0,
      "text",
      "editada",
    );
    expect(onAddMultipleChoiceOption).toHaveBeenCalledTimes(1);
    expect(onRemoveMultipleChoiceOption).toHaveBeenCalledWith(0);
    expect(onTogglePreview).toHaveBeenCalledWith(
      "multipleChoice.options.0.text",
    );
  }, 15000);
});
