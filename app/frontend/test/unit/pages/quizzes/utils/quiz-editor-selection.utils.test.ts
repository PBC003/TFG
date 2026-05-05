import { describe, expect, it } from "vitest";
import type { QuestionItem } from "../../../../../src/types/question";
import {
  buildSelectedQuestionMap,
  countSelectedQuizQuestionSlots,
  hasUnsupportedQuizEditorQuestionType,
  orderQuizEditorQuestions,
  paginateQuizEditorQuestions,
  toggleQuizEditorQuestionSelection,
  updateQuizEditorQuestionPoints,
  updateQuizEditorQuestionQuantity,
  updateQuizEditorQuestionToleranceOverride,
} from "../../../../../src/pages/quizzes/utils/quiz-editor-selection.utils";

const tfQuestion: QuestionItem = {
  questionId: "q-1",
  title: "Álgebra básica",
  type: "true_false",
  statement: "2 + 2 = 4",
  explanation: null,
  tags: ["aritmética"],
  createdByUserId: 1,
  updatedByUserId: 1,
  version: 1,
  questionConfig: { correctAnswer: true },
  createdAt: "2026-04-12T10:00:00.000Z",
  updatedAt: "2026-04-12T10:00:00.000Z",
};

const parametricQuestion: QuestionItem = {
  questionId: "q-2",
  title: "Serie geométrica",
  type: "parametric",
  statement: "Calcula la suma",
  explanation: null,
  tags: ["series"],
  createdByUserId: 1,
  updatedByUserId: 1,
  version: 1,
  questionConfig: {
    templateId: "series_geometric",
    tolerance: 0.25,
  },
  createdAt: "2026-04-12T10:00:00.000Z",
  updatedAt: "2026-04-12T10:00:00.000Z",
};

describe("quiz-editor-selection.utils", () => {
  it("builds selection maps, counts slots, orders results and paginates them", () => {
    const selected = [
      {
        questionId: "q-2",
        type: "parametric" as const,
        points: 2,
        quantity: 3,
      },
    ];

    const selectedMap = buildSelectedQuestionMap(selected);
    expect(selectedMap.get("q-2")).toEqual(selected[0]);
    expect(countSelectedQuizQuestionSlots(selected)).toBe(3);

    const ordered = orderQuizEditorQuestions(
      [parametricQuestion, tfQuestion],
      "serie",
      selectedMap,
    );
    expect(ordered[0]).toEqual(parametricQuestion);

    expect(paginateQuizEditorQuestions([1, 2, 3, 4, 5], 1, 2)).toEqual([3, 4]);
  });

  it("toggles question selection and initializes parametric defaults", () => {
    expect(toggleQuizEditorQuestionSelection([], "q-3")).toEqual([
      { questionId: "q-3", points: 1 },
    ]);

    const added = toggleQuizEditorQuestionSelection([], parametricQuestion);
    expect(added).toEqual([
      {
        questionId: "q-2",
        type: "parametric",
        points: 1,
        quantity: 1,
        toleranceOverride: "0.25",
      },
    ]);

    expect(
      toggleQuizEditorQuestionSelection(added, parametricQuestion),
    ).toEqual([]);

    expect(toggleQuizEditorQuestionSelection([], tfQuestion)).toEqual([
      {
        questionId: "q-1",
        type: "true_false",
        points: 1,
        quantity: 1,
        toleranceOverride: "",
      },
    ]);
  });

  it("updates points, quantities and tolerances while preserving other questions", () => {
    const current = [
      { questionId: "q-1", points: 2, quantity: 1, toleranceOverride: "" },
      {
        questionId: "q-2",
        points: 4,
        quantity: 2,
        toleranceOverride: "0.25",
      },
    ];

    expect(updateQuizEditorQuestionPoints(current, "q-2", "7")).toEqual([
      current[0],
      { questionId: "q-2", points: 7, quantity: 2, toleranceOverride: "0.25" },
    ]);
    expect(updateQuizEditorQuestionPoints(current, "q-2", "abc")).toEqual([
      current[0],
      { questionId: "q-2", points: 0, quantity: 2, toleranceOverride: "0.25" },
    ]);
    expect(updateQuizEditorQuestionQuantity(current, "q-2", "5")).toEqual([
      current[0],
      { questionId: "q-2", points: 4, quantity: 5, toleranceOverride: "0.25" },
    ]);
    expect(updateQuizEditorQuestionQuantity(current, "q-2", "nan")).toEqual([
      current[0],
      { questionId: "q-2", points: 4, quantity: 0, toleranceOverride: "0.25" },
    ]);
    expect(
      updateQuizEditorQuestionToleranceOverride(current, "q-2", "0.5"),
    ).toEqual([
      current[0],
      { questionId: "q-2", points: 4, quantity: 2, toleranceOverride: "0.5" },
    ]);
    expect(hasUnsupportedQuizEditorQuestionType()).toBe(false);
  });
});
