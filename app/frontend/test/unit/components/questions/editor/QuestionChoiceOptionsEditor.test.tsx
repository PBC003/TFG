import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuestionChoiceOptionsEditor } from "../../../../../src/components/questions/editor/QuestionChoiceOptionsEditor";
import type { EditableOption } from "../../../../../src/components/questions/editor/question-editor.types";

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
          preview-{fieldKey}
        </button>
        <button onClick={() => onChange(`${fieldKey}-editado`)}>
          change-{fieldKey}
        </button>
      </div>
    ),
  }),
);

const options: EditableOption[] = [
  { key: "a", text: "uno", feedback: "p1", isCorrect: true },
  { key: "b", text: "dos", feedback: "p2", isCorrect: false },
  { key: "c", text: "tres", feedback: "p3", isCorrect: false },
];

describe("QuestionChoiceOptionsEditor", () => {
  it("delegates option edits, toggles and collection actions", async () => {
    const onToggleCorrect = vi.fn();
    const onChangeOptionField = vi.fn();
    const onRemoveOption = vi.fn();
    const onAddOption = vi.fn();
    const onTogglePreview = vi.fn();

    render(
      <QuestionChoiceOptionsEditor
        deleteLabel="Borrar opción"
        options={options}
        correctLabel="Correcta"
        optionTextLabel="Texto"
        optionFeedbackLabel="Feedback"
        optionLabel={(index) => `Opción ${index + 1}`}
        addOptionLabel="Añadir opción"
        latexFieldHelper="latex"
        canSelectMultipleCorrect={false}
        onToggleCorrect={onToggleCorrect}
        onChangeOptionField={onChangeOptionField}
        onRemoveOption={onRemoveOption}
        onAddOption={onAddOption}
        isOptionPreview={() => false}
        onTogglePreview={onTogglePreview}
      />,
    );

    fireEvent.click(screen.getAllByRole("switch", { name: "Correcta" })[1]!);
    fireEvent.click(
      screen.getByRole("button", { name: "change-optionText.0" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "change-optionFeedback.0" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "preview-optionText.0" }),
    );
    fireEvent.click(
      screen.getAllByRole("button", { name: "Borrar opción" })[0]!,
    );
    fireEvent.click(screen.getByRole("button", { name: "Añadir opción" }));

    expect(onToggleCorrect).toHaveBeenCalledWith(1, true);
    expect(onChangeOptionField).toHaveBeenCalledWith(
      0,
      "text",
      "optionText.0-editado",
    );
    expect(onChangeOptionField).toHaveBeenCalledWith(
      0,
      "feedback",
      "optionFeedback.0-editado",
    );
    expect(onTogglePreview).toHaveBeenCalledWith("optionText.0");
    expect(onRemoveOption).toHaveBeenCalledWith(0);
    expect(onAddOption).toHaveBeenCalledTimes(1);
  }, 10000);

  it("passes the actual checked state when multiple correct answers are allowed", () => {
    const onToggleCorrect = vi.fn();

    render(
      <QuestionChoiceOptionsEditor
        deleteLabel="Borrar opción"
        options={options}
        correctLabel="Correcta"
        optionTextLabel="Texto"
        optionFeedbackLabel="Feedback"
        optionLabel={(index) => `Opción ${index + 1}`}
        addOptionLabel="Añadir opción"
        latexFieldHelper="latex"
        canSelectMultipleCorrect
        onToggleCorrect={onToggleCorrect}
        onChangeOptionField={vi.fn()}
        onRemoveOption={vi.fn()}
        onAddOption={vi.fn()}
        isOptionPreview={() => false}
        onTogglePreview={vi.fn()}
      />,
    );

    fireEvent.click(screen.getAllByRole("switch", { name: "Correcta" })[0]!);

    expect(onToggleCorrect).toHaveBeenCalledWith(0, false);
  });

  it("disables delete buttons when there are only two options", () => {
    render(
      <QuestionChoiceOptionsEditor
        deleteLabel="Borrar opción"
        options={options.slice(0, 2)}
        correctLabel="Correcta"
        optionTextLabel="Texto"
        optionFeedbackLabel="Feedback"
        optionLabel={(index) => `Opción ${index + 1}`}
        addOptionLabel="Añadir opción"
        latexFieldHelper="latex"
        canSelectMultipleCorrect
        onToggleCorrect={vi.fn()}
        onChangeOptionField={vi.fn()}
        onRemoveOption={vi.fn()}
        onAddOption={vi.fn()}
        isOptionPreview={() => false}
        onTogglePreview={vi.fn()}
      />,
    );

    screen
      .getAllByRole("button", { name: "Borrar opción" })
      .forEach((button) => expect(button).toBeDisabled());
  });
});
