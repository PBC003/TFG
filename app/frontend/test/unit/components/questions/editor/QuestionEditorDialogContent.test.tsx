import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuestionEditorDialogContent } from "../../../../../src/components/questions/editor/QuestionEditorDialogContent";
import type {
  EditableOption,
  FormState,
  PreviewState,
} from "../../../../../src/components/questions/editor/question-editor.types";

vi.mock(
  "../../../../../src/components/questions/editor/QuestionMathField",
  () => ({
    QuestionMathField: (props: {
      fieldKey: string;
      label: string;
      value: string;
      isPreview: boolean;
      onTogglePreview: (fieldKey: string) => void;
      onChange: (value: string) => void;
    }) => (
      <div>
        <span>{props.label}</span>
        <span>{String(props.isPreview)}</span>
        <button onClick={() => props.onTogglePreview(props.fieldKey)}>
          toggle-{props.fieldKey}
        </button>
        <button onClick={() => props.onChange(`${props.value}-editado`)}>
          change-{props.fieldKey}
        </button>
      </div>
    ),
  }),
);

vi.mock(
  "../../../../../src/components/questions/editor/QuestionTagsEditor",
  () => ({
    QuestionTagsEditor: (props: {
      label: string;
      newTagValue: string;
      onNewTagChange: (value: string) => void;
      onAddTag: () => void;
      onRemoveTag: (tag: string) => void;
    }) => (
      <div>
        <span>{props.label}</span>
        <button
          onClick={() => props.onNewTagChange(`${props.newTagValue}nueva`)}
        >
          change-tag
        </button>
        <button onClick={props.onAddTag}>add-tag</button>
        <button onClick={() => props.onRemoveTag("tag-1")}>remove-tag</button>
      </div>
    ),
  }),
);

vi.mock(
  "../../../../../src/components/questions/config/QuestionTypeSpecificConfig",
  () => ({
    QuestionTypeSpecificConfig: (props: {
      isPreview: (fieldKey: string) => boolean;
      onTogglePreview: (fieldKey: string) => void;
      onUpdateForm: (updater: (current: FormState) => FormState) => void;
      onUpdateSingleChoiceOption: (
        index: number,
        field: keyof EditableOption,
        value: string | boolean,
      ) => void;
      onUpdateMultipleChoiceOption: (
        index: number,
        field: keyof EditableOption,
        value: string | boolean,
      ) => void;
      onAddSingleChoiceOption: () => void;
      onAddMultipleChoiceOption: () => void;
      onRemoveSingleChoiceOption: (index: number) => void;
      onRemoveMultipleChoiceOption: (index: number) => void;
    }) => (
      <div>
        <span>{String(props.isPreview("statement"))}</span>
        <button onClick={() => props.onTogglePreview("statement")}>
          type-toggle
        </button>
        <button
          onClick={() =>
            props.onUpdateForm((current) => ({
              ...current,
              explanation: "desde-config",
            }))
          }
        >
          update-form
        </button>
        <button
          onClick={() => props.onUpdateSingleChoiceOption(0, "text", "uno")}
        >
          single-option
        </button>
        <button
          onClick={() =>
            props.onUpdateMultipleChoiceOption(0, "isCorrect", true)
          }
        >
          multi-option
        </button>
        <button onClick={props.onAddSingleChoiceOption}>add-single</button>
        <button onClick={props.onAddMultipleChoiceOption}>add-multi</button>
        <button onClick={() => props.onRemoveSingleChoiceOption(0)}>
          remove-single
        </button>
        <button onClick={() => props.onRemoveMultipleChoiceOption(1)}>
          remove-multi
        </button>
      </div>
    ),
  }),
);

const form: FormState = {
  title: "Pregunta",
  type: "true_false",
  statement: "Enunciado",
  explanation: "Feedback",
  tags: ["tag-1", "tag-2"],
  newTag: "",
  trueFalse: {
    correctAnswer: true,
    feedbackForTrue: "",
    feedbackForFalse: "",
  },
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

const previewFields: PreviewState = {
  statement: true,
  generalFeedback: false,
};

describe("QuestionEditorDialogContent", () => {
  it("renders the form shell and wires all editor callbacks", async () => {
    const user = userEvent.setup();
    let currentForm: FormState = structuredClone(form);
    const onUpdateForm = vi.fn((updater: (current: FormState) => FormState) => {
      currentForm = updater(currentForm);
    });
    const onTogglePreviewField = vi.fn();
    const onAddTag = vi.fn();
    const onUpdateSingleChoiceOption = vi.fn();
    const onUpdateMultipleChoiceOption = vi.fn();
    const onAddSingleChoiceOption = vi.fn();
    const onAddMultipleChoiceOption = vi.fn();
    const onRemoveSingleChoiceOption = vi.fn();
    const onRemoveMultipleChoiceOption = vi.fn();
    const t = (key: string) => key;

    render(
      <QuestionEditorDialogContent
        form={form}
        formError="error-form"
        previewFields={previewFields}
        t={t as never}
        onUpdateForm={onUpdateForm}
        onTogglePreviewField={onTogglePreviewField}
        onAddTag={onAddTag}
        onUpdateSingleChoiceOption={onUpdateSingleChoiceOption}
        onUpdateMultipleChoiceOption={onUpdateMultipleChoiceOption}
        onAddSingleChoiceOption={onAddSingleChoiceOption}
        onAddMultipleChoiceOption={onAddMultipleChoiceOption}
        onRemoveSingleChoiceOption={onRemoveSingleChoiceOption}
        onRemoveMultipleChoiceOption={onRemoveMultipleChoiceOption}
      />,
    );

    expect(
      screen.getByText("questions.dialogs.latexTitle"),
    ).toBeInTheDocument();
    expect(screen.getByText("error-form")).toBeInTheDocument();

    fireEvent.change(
      screen.getByRole("textbox", { name: "questions.fields.title" }),
      {
        target: { value: "Nueva pregunta" },
      },
    );
    await user.click(
      screen.getByRole("combobox", { name: "questions.fields.type" }),
    );
    await user.click(
      screen.getByRole("option", { name: "questions.types.single_choice" }),
    );

    await user.click(screen.getByRole("button", { name: "toggle-statement" }));
    await user.click(screen.getByRole("button", { name: "change-statement" }));
    await user.click(
      screen.getByRole("button", { name: "toggle-generalFeedback" }),
    );
    await user.click(
      screen.getByRole("button", { name: "change-generalFeedback" }),
    );
    await user.click(screen.getByRole("button", { name: "change-tag" }));
    await user.click(screen.getByRole("button", { name: "add-tag" }));
    await user.click(screen.getByRole("button", { name: "remove-tag" }));
    await user.click(screen.getByRole("button", { name: "type-toggle" }));
    await user.click(screen.getByRole("button", { name: "update-form" }));
    await user.click(screen.getByRole("button", { name: "single-option" }));
    await user.click(screen.getByRole("button", { name: "multi-option" }));
    await user.click(screen.getByRole("button", { name: "add-single" }));
    await user.click(screen.getByRole("button", { name: "add-multi" }));
    await user.click(screen.getByRole("button", { name: "remove-single" }));
    await user.click(screen.getByRole("button", { name: "remove-multi" }));

    expect(currentForm.title).toBe("Nueva pregunta");
    expect(currentForm.type).toBe("single_choice");
    expect(currentForm.statement).toBe("Enunciado-editado");
    expect(currentForm.explanation).toBe("desde-config");
    expect(currentForm.newTag).toBe("nueva");
    expect(currentForm.tags).toEqual(["tag-2"]);

    expect(onTogglePreviewField).toHaveBeenCalledWith("statement");
    expect(onTogglePreviewField).toHaveBeenCalledWith("generalFeedback");
    expect(onTogglePreviewField).toHaveBeenCalledWith("statement");
    expect(onAddTag).toHaveBeenCalled();
    expect(onUpdateSingleChoiceOption).toHaveBeenCalledWith(0, "text", "uno");
    expect(onUpdateMultipleChoiceOption).toHaveBeenCalledWith(
      0,
      "isCorrect",
      true,
    );
    expect(onAddSingleChoiceOption).toHaveBeenCalled();
    expect(onAddMultipleChoiceOption).toHaveBeenCalled();
    expect(onRemoveSingleChoiceOption).toHaveBeenCalledWith(0);
    expect(onRemoveMultipleChoiceOption).toHaveBeenCalledWith(1);
  });
});
