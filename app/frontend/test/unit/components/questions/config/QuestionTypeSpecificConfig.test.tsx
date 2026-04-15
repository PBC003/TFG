import { render, screen } from "@testing-library/react";
import { useEffect, useState } from "react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuestionTypeSpecificConfig } from "../../../../../src/components/questions/config/QuestionTypeSpecificConfig";
import type {
  EditableOption,
  FormState,
} from "../../../../../src/components/questions/editor/question-editor.types";

vi.mock(
  "../../../../../src/components/questions/editor/QuestionTrueFalseEditor",
  () => ({
    QuestionTrueFalseEditor: (props: {
      answerLabel: string;
      trueLabel: string;
      falseLabel: string;
      optionFeedbackLabel: string;
      latexFieldHelper: string;
      isPreview: (fieldKey: string) => boolean;
      onTogglePreview: (fieldKey: string) => void;
      onCorrectAnswerChange: (value: boolean) => void;
      onFeedbackForTrueChange: (value: string) => void;
      onFeedbackForFalseChange: (value: string) => void;
    }) => (
      <div>
        <div>{props.answerLabel}</div>
        <div>{props.trueLabel}</div>
        <div>{props.falseLabel}</div>
        <div>{props.optionFeedbackLabel}</div>
        <div>{props.latexFieldHelper}</div>
        <div>{String(props.isPreview("trueFalse.feedbackForTrue"))}</div>
        <button onClick={() => props.onCorrectAnswerChange(false)}>
          change-correct-answer
        </button>
        <button onClick={() => props.onFeedbackForTrueChange("feedback true")}>
          change-feedback-true
        </button>
        <button
          onClick={() => props.onFeedbackForFalseChange("feedback false")}
        >
          change-feedback-false
        </button>
        <button
          onClick={() => props.onTogglePreview("trueFalse.feedbackForTrue")}
        >
          toggle-true-false-preview
        </button>
      </div>
    ),
  }),
);

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
      onToggleCorrect: (index: number, checked?: boolean) => void;
      onChangeOptionField: (
        index: number,
        field: keyof EditableOption,
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
        <button
          onClick={() =>
            props.onChangeOptionField(0, "feedback", "explicación")
          }
        >
          change-field
        </button>
        <button onClick={props.onAddOption}>add-option</button>
        <button onClick={() => props.onRemoveOption(0)}>remove-option</button>
        <button onClick={() => props.onTogglePreview("options.0.text")}>
          toggle-preview
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
  parametric: {
    templateId: "limit_trigonometric",
    sampleSeed: 1,
  },
};

function renderConfig(
  form: FormState,
  overrides: Partial<
    React.ComponentProps<typeof QuestionTypeSpecificConfig>
  > = {},
) {
  const onUpdateForm = overrides.onUpdateForm ?? vi.fn();
  const onUpdateSingleChoiceOption =
    overrides.onUpdateSingleChoiceOption ?? vi.fn();
  const onUpdateMultipleChoiceOption =
    overrides.onUpdateMultipleChoiceOption ?? vi.fn();
  const onAddSingleChoiceOption = overrides.onAddSingleChoiceOption ?? vi.fn();
  const onAddMultipleChoiceOption =
    overrides.onAddMultipleChoiceOption ?? vi.fn();
  const onRemoveSingleChoiceOption =
    overrides.onRemoveSingleChoiceOption ?? vi.fn();
  const onRemoveMultipleChoiceOption =
    overrides.onRemoveMultipleChoiceOption ?? vi.fn();
  const onTogglePreview = overrides.onTogglePreview ?? vi.fn();
  const isPreview = overrides.isPreview ?? vi.fn(() => false);

  const view = render(
    <QuestionTypeSpecificConfig
      form={form}
      latexFieldHelper="latex"
      isPreview={isPreview}
      onTogglePreview={onTogglePreview}
      onUpdateForm={onUpdateForm}
      onUpdateSingleChoiceOption={onUpdateSingleChoiceOption}
      onUpdateMultipleChoiceOption={onUpdateMultipleChoiceOption}
      onAddSingleChoiceOption={onAddSingleChoiceOption}
      onAddMultipleChoiceOption={onAddMultipleChoiceOption}
      onRemoveSingleChoiceOption={onRemoveSingleChoiceOption}
      onRemoveMultipleChoiceOption={onRemoveMultipleChoiceOption}
    />,
  );

  return {
    onUpdateForm,
    onUpdateSingleChoiceOption,
    onUpdateMultipleChoiceOption,
    onAddSingleChoiceOption,
    onAddMultipleChoiceOption,
    onRemoveSingleChoiceOption,
    onRemoveMultipleChoiceOption,
    onTogglePreview,
    isPreview,
    rerender: (nextForm: FormState) =>
      view.rerender(
        <QuestionTypeSpecificConfig
          form={nextForm}
          latexFieldHelper="latex"
          isPreview={isPreview}
          onTogglePreview={onTogglePreview}
          onUpdateForm={onUpdateForm}
          onUpdateSingleChoiceOption={onUpdateSingleChoiceOption}
          onUpdateMultipleChoiceOption={onUpdateMultipleChoiceOption}
          onAddSingleChoiceOption={onAddSingleChoiceOption}
          onAddMultipleChoiceOption={onAddMultipleChoiceOption}
          onRemoveSingleChoiceOption={onRemoveSingleChoiceOption}
          onRemoveMultipleChoiceOption={onRemoveMultipleChoiceOption}
        />,
      ),
  };
}

function renderStatefulParametricConfig(initialForm: FormState) {
  const state = {
    latestForm: initialForm,
  };

  function Harness() {
    const [form, setForm] = useState<FormState>(initialForm);

    useEffect(() => {
      state.latestForm = form;
    }, [form]);

    return (
      <QuestionTypeSpecificConfig
        form={form}
        latexFieldHelper="latex"
        isPreview={() => false}
        onTogglePreview={vi.fn()}
        onUpdateForm={(updater) => {
          setForm((current) => updater(current));
        }}
        onUpdateSingleChoiceOption={vi.fn()}
        onUpdateMultipleChoiceOption={vi.fn()}
        onAddSingleChoiceOption={vi.fn()}
        onAddMultipleChoiceOption={vi.fn()}
        onRemoveSingleChoiceOption={vi.fn()}
        onRemoveMultipleChoiceOption={vi.fn()}
      />
    );
  }

  render(<Harness />);

  return {
    getForm: () => state.latestForm,
  };
}

describe("QuestionTypeSpecificConfig", () => {
  it("renders the true/false branch and updates all true/false fields", async () => {
    const user = userEvent.setup();
    let currentForm: FormState = structuredClone(baseForm);
    const onUpdateForm = vi.fn((updater: (current: FormState) => FormState) => {
      currentForm = updater(currentForm);
    });
    const isPreview = vi.fn(
      (fieldKey: string) => fieldKey === "trueFalse.feedbackForTrue",
    );
    const onTogglePreview = vi.fn();

    renderConfig(baseForm, { onUpdateForm, isPreview, onTogglePreview });

    expect(
      screen.getByText("questions.fields.typeSpecificConfig"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("questions.fields.correctAnswer"),
    ).toBeInTheDocument();
    expect(screen.getByText("questions.answers.true")).toBeInTheDocument();
    expect(screen.getByText("questions.answers.false")).toBeInTheDocument();
    expect(
      screen.getByText("questions.fields.optionFeedback"),
    ).toBeInTheDocument();
    expect(screen.getByText("latex")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "change-correct-answer" }),
    );
    await user.click(
      screen.getByRole("button", { name: "change-feedback-true" }),
    );
    await user.click(
      screen.getByRole("button", { name: "change-feedback-false" }),
    );
    await user.click(
      screen.getByRole("button", { name: "toggle-true-false-preview" }),
    );

    expect(currentForm.trueFalse.correctAnswer).toBe(false);
    expect(currentForm.trueFalse.feedbackForTrue).toBe("feedback true");
    expect(currentForm.trueFalse.feedbackForFalse).toBe("feedback false");
    expect(isPreview).toHaveBeenCalledWith("trueFalse.feedbackForTrue");
    expect(onTogglePreview).toHaveBeenCalledWith("trueFalse.feedbackForTrue");
  });

  it("renders the single-choice branch and wires every child callback", async () => {
    const user = userEvent.setup();
    const singleChoiceForm: FormState = { ...baseForm, type: "single_choice" };
    let currentForm: FormState = structuredClone(singleChoiceForm);
    const onUpdateForm = vi.fn((updater: (current: FormState) => FormState) => {
      currentForm = updater(currentForm);
    });
    const onUpdateSingleChoiceOption = vi.fn();
    const onAddSingleChoiceOption = vi.fn();
    const onRemoveSingleChoiceOption = vi.fn();
    const onTogglePreview = vi.fn();
    const isPreview = vi.fn(
      (fieldKey: string) => fieldKey === "singleChoice.options.0.text",
    );

    renderConfig(singleChoiceForm, {
      onUpdateForm,
      onUpdateSingleChoiceOption,
      onAddSingleChoiceOption,
      onRemoveSingleChoiceOption,
      onTogglePreview,
      isPreview,
    });

    expect(
      screen.getByText("questions.fields.correctOption"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("questions.fields.optionLabel"),
    ).toBeInTheDocument();
    expect(screen.getByText("false")).toBeInTheDocument();

    await user.click(
      screen.getByRole("switch", { name: "questions.fields.randomizeOptions" }),
    );
    await user.click(screen.getByRole("button", { name: "toggle-correct" }));
    await user.click(screen.getByRole("button", { name: "change-field" }));
    await user.click(screen.getByRole("button", { name: "add-option" }));
    await user.click(screen.getByRole("button", { name: "remove-option" }));
    await user.click(screen.getByRole("button", { name: "toggle-preview" }));

    expect(currentForm.singleChoice.randomizeOptions).toBe(true);
    expect(onUpdateSingleChoiceOption).toHaveBeenCalledWith(
      0,
      "isCorrect",
      true,
    );
    expect(onUpdateSingleChoiceOption).toHaveBeenCalledWith(
      0,
      "feedback",
      "explicación",
    );
    expect(onAddSingleChoiceOption).toHaveBeenCalledTimes(1);
    expect(onRemoveSingleChoiceOption).toHaveBeenCalledWith(0);
    expect(isPreview).toHaveBeenCalledWith("singleChoice.options.0.text");
    expect(onTogglePreview).toHaveBeenCalledWith("singleChoice.options.0.text");
  });

  it("renders the multiple-choice branch and updates grading mode", async () => {
    const user = userEvent.setup();
    const multipleChoiceForm: FormState = {
      ...baseForm,
      type: "multiple_choice",
    };
    let currentForm: FormState = structuredClone(multipleChoiceForm);
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

    renderConfig(multipleChoiceForm, {
      onUpdateForm,
      onUpdateMultipleChoiceOption,
      onAddMultipleChoiceOption,
      onRemoveMultipleChoiceOption,
      onTogglePreview,
      isPreview,
    });

    expect(
      screen.getByRole("combobox", { name: "questions.fields.gradingMode" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("questions.gradingModes.all_or_nothing"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("true")).toHaveLength(2);

    await user.click(
      screen.getByRole("switch", { name: "questions.fields.randomizeOptions" }),
    );
    await user.click(
      screen.getByRole("combobox", { name: "questions.fields.gradingMode" }),
    );
    expect(
      screen.getByRole("option", {
        name: "questions.gradingModes.partial_credit",
      }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("option", {
        name: "questions.gradingModes.partial_credit",
      }),
    );
    await user.click(screen.getByRole("button", { name: "toggle-correct" }));
    await user.click(screen.getByRole("button", { name: "change-field" }));
    await user.click(screen.getByRole("button", { name: "add-option" }));
    await user.click(screen.getByRole("button", { name: "remove-option" }));
    await user.click(screen.getByRole("button", { name: "toggle-preview" }));

    expect(currentForm.multipleChoice.randomizeOptions).toBe(true);
    expect(currentForm.multipleChoice.gradingMode).toBe("partial_credit");
    expect(onUpdateMultipleChoiceOption).toHaveBeenCalledWith(
      0,
      "isCorrect",
      false,
    );
    expect(onUpdateMultipleChoiceOption).toHaveBeenCalledWith(
      0,
      "feedback",
      "explicación",
    );
    expect(onAddMultipleChoiceOption).toHaveBeenCalledTimes(1);
    expect(onRemoveMultipleChoiceOption).toHaveBeenCalledWith(0);
    expect(isPreview).toHaveBeenCalledWith("multipleChoice.options.0.text");
    expect(onTogglePreview).toHaveBeenCalledWith(
      "multipleChoice.options.0.text",
    );
  });

  it("renders the parametric branch and updates template and sample seed", async () => {
    const user = userEvent.setup();
    const dateNowSpy = vi.spyOn(Date, "now").mockReturnValue(202);

    const initialForm: FormState = {
      ...structuredClone(baseForm),
      type: "parametric",
    };

    const { getForm } = renderStatefulParametricConfig(initialForm);

    expect(
      screen.getByText("questions.dialogs.parametricHelper"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("questions.fields.parametricTemplate"),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("combobox", {
        name: "questions.fields.parametricTemplate",
      }),
    );
    await user.click(
      screen.getByRole("option", {
        name: "questions.parametricTemplates.integral_logarithmic",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "questions.actions.regenerateParametricSample",
      }),
    );

    const currentForm = getForm();

    expect(currentForm.parametric.templateId).toBe("integral_logarithmic");
    expect(currentForm.statement).toContain("\\int_{1}^{e}");
    expect(currentForm.parametric.sampleSeed).toBe(202);

    dateNowSpy.mockRestore();
  });
});
