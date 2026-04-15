import { describe, expect, it } from "vitest";
import type { QuestionItem } from "../../../../../src/types/question";
import {
  QUESTION_TYPES,
  buildInitialState,
  buildOptionKey,
  buildQuestionConfig,
  createEmptyOption,
  ensureAtLeastOneCorrectOption,
  normalizeTags,
  validateForm,
} from "../../../../../src/components/questions/editor/question-editor.utils";
import { createT } from "../../../../utils/i18n";

const t = createT();

const baseQuestion = {
  questionId: "q-1",
  title: "Integral básica",
  type: "multiple_choice",
  statement: "\\int x dx",
  explanation: "General",
  tags: ["integrales", "cálculo"],
  createdByUserId: 1,
  updatedByUserId: 1,
  version: 2,
  createdAt: "2026-03-30T10:00:00.000Z",
  updatedAt: "2026-03-30T10:00:00.000Z",
  questionConfig: {
    options: [
      { key: "a", text: "x^2/2", feedback: "Bien" },
      { key: "b", text: "x^3/3", feedback: null },
    ],
    correctOptionKeys: ["a"],
    randomizeOptions: true,
    gradingMode: "partial_credit",
  },
} satisfies QuestionItem;

describe("question-editor.utils", () => {
  it("exposes supported types and stable option keys", () => {
    expect(QUESTION_TYPES).toEqual([
      "true_false",
      "single_choice",
      "multiple_choice",
      "parametric",
    ]);
    expect(buildOptionKey(0)).toBe("a");
    expect(buildOptionKey(2)).toBe("c");
  });

  it("creates empty options with predictable defaults", () => {
    expect(createEmptyOption(1, true)).toEqual({
      key: "b",
      text: "",
      feedback: "",
      isCorrect: true,
    });
  });

  it("builds the default form state for new questions", () => {
    const state = buildInitialState(null);
    expect(state.title).toBe("");
    expect(state.type).toBe("true_false");
    expect(state.tags).toEqual([]);
    expect(state.singleChoice.options).toHaveLength(2);
    expect(state.singleChoice.options[0]?.isCorrect).toBe(true);
    expect(state.multipleChoice.gradingMode).toBe("all_or_nothing");
    expect(state.parametric.templateId).toBe("limit_trigonometric");
  });

  it("hydrates true/false, choice and parametric questions using safe fallbacks", () => {
    const trueFalse: QuestionItem = {
      ...baseQuestion,
      type: "true_false",
      questionConfig: { correctAnswer: false },
    };
    const singleChoice: QuestionItem = {
      ...baseQuestion,
      type: "single_choice",
      questionConfig: {
        options: [
          { key: "a", text: "uno", feedback: null },
          { key: "b", text: "dos", feedback: "pista" },
        ],
        correctOptionKey: "b",
      },
    };
    const parametric: QuestionItem = {
      ...baseQuestion,
      type: "parametric",
      statement: "texto libre que debe regenerarse",
      questionConfig: {
        templateId: "integral_logarithmic",
      },
    };
    const tfState = buildInitialState(trueFalse);
    const scState = buildInitialState(singleChoice);
    const mcState = buildInitialState(baseQuestion);
    const pState = buildInitialState(parametric);
    expect(tfState.trueFalse.correctAnswer).toBe(false);
    expect(scState.singleChoice.options[1]?.isCorrect).toBe(true);
    expect(mcState.multipleChoice.options[0]?.isCorrect).toBe(true);
    expect(mcState.multipleChoice.randomizeOptions).toBe(true);
    expect(pState.parametric.templateId).toBe("integral_logarithmic");
    expect(pState.statement).toContain("\\int_{1}^{e}");
  });

  it("normalizes tags and keeps at least one correct option", () => {
    expect(normalizeTags([" integrales ", "series", "integrales", ""])).toEqual(
      ["integrales", "series"],
    );
    expect(
      ensureAtLeastOneCorrectOption([
        { key: "a", text: "A", feedback: "", isCorrect: false },
        { key: "b", text: "B", feedback: "", isCorrect: false },
      ]),
    ).toEqual([
      { key: "a", text: "A", feedback: "", isCorrect: true },
      { key: "b", text: "B", feedback: "", isCorrect: false },
    ]);
  });

  it("builds question configs for each supported branch", () => {
    const common = {
      title: "Pregunta",
      statement: "stmt",
      explanation: "exp",
      tags: [],
      newTag: "",
      trueFalse: {
        correctAnswer: false,
        feedbackForTrue: "bien",
        feedbackForFalse: "mal",
      },
      singleChoice: {
        options: [
          { key: "a", text: "uno", feedback: "", isCorrect: false },
          { key: "b", text: "dos", feedback: "pista", isCorrect: true },
        ],
        randomizeOptions: true,
      },
      multipleChoice: {
        options: [
          { key: "a", text: "uno", feedback: "", isCorrect: true },
          { key: "b", text: "dos", feedback: "pista", isCorrect: false },
        ],
        randomizeOptions: false,
        gradingMode: "partial_credit" as const,
      },
      parametric: {
        templateId: "series_geometric" as const,
        sampleSeed: 1,
      },
    };
    expect(buildQuestionConfig({ ...common, type: "true_false" })).toEqual({
      correctAnswer: false,
      feedbackForTrue: "bien",
      feedbackForFalse: "mal",
    });
    expect(buildQuestionConfig({ ...common, type: "single_choice" })).toEqual({
      options: [
        { key: "a", text: "uno", feedback: null },
        { key: "b", text: "dos", feedback: "pista" },
      ],
      correctOptionKey: "b",
      randomizeOptions: true,
    });
    expect(buildQuestionConfig({ ...common, type: "multiple_choice" })).toEqual(
      {
        options: [
          { key: "a", text: "uno", feedback: null },
          { key: "b", text: "dos", feedback: "pista" },
        ],
        correctOptionKeys: ["a"],
        randomizeOptions: false,
        gradingMode: "partial_credit",
      },
    );
    expect(buildQuestionConfig({ ...common, type: "parametric" })).toEqual({
      templateId: "series_geometric",
    });
  });

  it("validates forms and returns translated keys", () => {
    const invalidTitle = buildInitialState(null);
    invalidTitle.title = "ab";
    invalidTitle.statement = "stmt";
    const invalidStatement = buildInitialState(null);
    invalidStatement.title = "válida";
    const invalidSingle = buildInitialState(null);
    invalidSingle.title = "válida";
    invalidSingle.type = "single_choice";
    invalidSingle.statement = "stmt";
    invalidSingle.singleChoice.options[1] = {
      ...invalidSingle.singleChoice.options[1]!,
      text: "",
    };
    const invalidMultiple = buildInitialState(null);
    invalidMultiple.title = "válida";
    invalidMultiple.type = "multiple_choice";
    invalidMultiple.statement = "stmt";
    invalidMultiple.multipleChoice.options.forEach((option, index) => {
      option.text = `opcion-${index}`;
      option.isCorrect = false;
    });
    expect(validateForm(invalidTitle, t)).toBe(
      "questions.dialogs.titleValidation",
    );
    expect(validateForm(invalidStatement, t)).toBe(
      "questions.dialogs.statementValidation",
    );
    expect(validateForm(invalidSingle, t)).toBe(
      "questions.dialogs.optionsValidation",
    );
    expect(validateForm(invalidMultiple, t)).toBe(
      "questions.dialogs.multipleChoiceValidation",
    );
    const valid = buildInitialState(null);
    valid.title = "Pregunta válida";
    valid.statement = "stmt";
    expect(validateForm(valid, t)).toBeNull();
  });
});
