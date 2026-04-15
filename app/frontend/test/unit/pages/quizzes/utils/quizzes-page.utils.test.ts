import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildQuizAccessUrl,
  filterQuizzes,
  paginateItems,
  prependQuizItem,
  removeQuizItem,
  replaceQuizItem,
} from "../../../../../src/pages/quizzes/utils/quizzes-page.utils";
import {
  QUESTION_ROWS_PER_PAGE_OPTIONS,
  getInitialQuizEditorState,
  normalizeForSearch,
  toIsoDateTimeValue,
  toLocalDateTimeValue,
} from "../../../../../src/pages/quizzes/utils/quiz-editor-dialog.utils";
import {
  buildSelectedQuestionMap,
  hasUnsupportedQuizEditorQuestionType,
  orderQuizEditorQuestions,
  paginateQuizEditorQuestions,
  toggleQuizEditorQuestionSelection,
  updateQuizEditorQuestionPoints,
} from "../../../../../src/pages/quizzes/utils/quiz-editor-selection.utils";
import { buildQuizEditorPayload } from "../../../../../src/pages/quizzes/utils/quiz-editor-submit.utils";

describe("quizzes page and editor utils", () => {
  const quiz = {
    quizId: "quiz-1",
    title: "Quiz Cálculo",
    description: "Integrales",
    accessCode: "ABCD",
    requiresAccessCode: true,
    status: "draft",
    hasAttempts: false,
    canEdit: true,
    canDelete: true,
    attemptsAllowed: 2,
    startAt: "2026-04-12T10:00:00.000Z",
    endAt: "2026-04-12T11:00:00.000Z",
    timeLimitMinutes: 15,
    shuffleQuestions: true,
    revealAnswersAfterClose: false,
    publishedAt: null,
    totalQuestions: 1,
    totalPoints: 2,
    questions: [{ questionId: "q-1", points: 2 }],
    createdByUserId: 1,
    updatedByUserId: 1,
    version: 1,
    createdAt: "2026-04-12T09:00:00.000Z",
    updatedAt: "2026-04-12T09:00:00.000Z",
  };
  const questionBank = [
    {
      questionId: "q-1",
      title: "Álgebra",
      statement: "S1",
      tags: ["uno"],
      type: "true_false",
    },
    {
      questionId: "q-2",
      title: "Paramétrica",
      statement: "S2",
      tags: ["dos"],
      type: "parametric",
    },
  ];

  beforeEach(() => {
    vi.stubGlobal("window", {
      location: { origin: "http://localhost:5173" },
      confirm: vi.fn(() => true),
    });
  });

  it("filters quiz lists and updates collection helpers", () => {
    expect(filterQuizzes([quiz as never], "integrales", "all")).toEqual([quiz]);
    expect(
      filterQuizzes([{ ...quiz, status: "published" } as never], "", "draft"),
    ).toEqual([]);
    expect(buildQuizAccessUrl("quiz-1")).toBe(
      "http://localhost:5173/quiz-access/quiz-1",
    );
    expect(
      replaceQuizItem([quiz as never], { ...quiz, title: "Nuevo" } as never)[0]
        ?.title,
    ).toBe("Nuevo");
    expect(
      prependQuizItem([quiz as never], {
        ...quiz,
        quizId: "quiz-2",
      } as never).map((item) => item.quizId),
    ).toEqual(["quiz-2", "quiz-1"]);
    expect(removeQuizItem([quiz as never], "quiz-1")).toEqual([]);
    expect(paginateItems([1, 2, 3], 1, 2)).toEqual([3]);
  });

  it("normalizes editor values, selection helpers and validation payloads", () => {
    expect(QUESTION_ROWS_PER_PAGE_OPTIONS).toEqual([5, 10, 20, 50]);
    const localDateTime = toLocalDateTimeValue("2026-04-12T10:05:00.000Z");
    expect(localDateTime).toMatch(/^2026-04-12T\d{2}:05$/);
    expect(toIsoDateTimeValue("")).toBeNull();
    expect(normalizeForSearch(" Álg_{x} ")).toBe(" alg  x  ");
    expect(getInitialQuizEditorState(quiz as never)).toEqual(
      expect.objectContaining({
        quizTitle: "Quiz Cálculo",
        accessCode: "ABCD",
        selectedQuestions: [{ questionId: "q-1", points: 2 }],
      }),
    );

    const selected = buildSelectedQuestionMap([
      { questionId: "q-1", points: 2 },
    ]);
    expect(
      orderQuizEditorQuestions(questionBank as never, "algebra", selected).map(
        (item) => item.questionId,
      ),
    ).toEqual(["q-1"]);
    expect(paginateQuizEditorQuestions(questionBank, 0, 1)).toEqual([
      questionBank[0],
    ]);
    expect(toggleQuizEditorQuestionSelection([], "q-1")).toEqual([
      { questionId: "q-1", points: 1 },
    ]);
    expect(
      toggleQuizEditorQuestionSelection(
        [{ questionId: "q-1", points: 1 }],
        "q-1",
      ),
    ).toEqual([]);
    expect(
      updateQuizEditorQuestionPoints(
        [{ questionId: "q-1", points: 1 }],
        "q-1",
        "3",
      ),
    ).toEqual([{ questionId: "q-1", points: 3 }]);
    expect(
      updateQuizEditorQuestionPoints(
        [{ questionId: "q-1", points: 1 }],
        "q-1",
        "x",
      ),
    ).toEqual([{ questionId: "q-1", points: 0 }]);
    expect(hasUnsupportedQuizEditorQuestionType()).toBe(false);

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-12T10:00:00.000Z"));
    const futureStartAt = toLocalDateTimeValue("2026-04-12T10:30:00.000Z");
    const pastEndAt = toLocalDateTimeValue("2026-04-12T09:30:00.000Z");
    const futureEndAt = toLocalDateTimeValue("2026-04-12T11:30:00.000Z");
    expect(
      buildQuizEditorPayload({
        quizTitle: "ab",
        quizDescription: "",
        accessCode: "",
        attemptsAllowed: "2",
        startAt: "",
        endAt: "",
        timeLimitMinutes: "",
        shuffleQuestions: false,
        revealAnswersAfterClose: false,
        selectedQuestions: [{ questionId: "q-1", points: 1 }],
        hasUnsupportedSelectedQuestion: false,
        validationMessage: "invalid",
        fields: {
          invalidDateRange: "range",
          invalidEndDateInPast: "past",
        } as never,
      }).payload,
    ).toBeNull();
    expect(
      buildQuizEditorPayload({
        quizTitle: "Quiz válido",
        quizDescription: " Desc ",
        accessCode: " abcd ",
        attemptsAllowed: "2",
        startAt: futureStartAt,
        endAt: pastEndAt,
        timeLimitMinutes: "20",
        shuffleQuestions: true,
        revealAnswersAfterClose: true,
        selectedQuestions: [{ questionId: "q-1", points: 2 }],
        hasUnsupportedSelectedQuestion: false,
        validationMessage: "invalid",
        fields: {
          invalidDateRange: "range",
          invalidEndDateInPast: "past",
        } as never,
      }).validationMessage,
    ).toBe("range");
    expect(
      buildQuizEditorPayload({
        quizTitle: "Quiz válido",
        quizDescription: " Desc ",
        accessCode: " abcd ",
        attemptsAllowed: "2",
        startAt: "",
        endAt: pastEndAt,
        timeLimitMinutes: "20",
        shuffleQuestions: true,
        revealAnswersAfterClose: true,
        selectedQuestions: [{ questionId: "q-1", points: 2 }],
        hasUnsupportedSelectedQuestion: false,
        validationMessage: "invalid",
        fields: {
          invalidDateRange: "range",
          invalidEndDateInPast: "past",
        } as never,
      }).validationMessage,
    ).toBe("past");

    const built = buildQuizEditorPayload({
      quizTitle: " Quiz válido ",
      quizDescription: " Desc ",
      accessCode: " abcd ",
      attemptsAllowed: "2",
      startAt: futureStartAt,
      endAt: futureEndAt,
      timeLimitMinutes: "20",
      shuffleQuestions: true,
      revealAnswersAfterClose: true,
      selectedQuestions: [{ questionId: "q-1", points: 2 }],
      hasUnsupportedSelectedQuestion: false,
      validationMessage: "invalid",
      fields: {
        invalidDateRange: "range",
        invalidEndDateInPast: "past",
      } as never,
    });
    expect(built).toEqual(
      expect.objectContaining({
        validationMessage: null,
        payload: expect.objectContaining({
          title: "Quiz válido",
          description: "Desc",
          accessCode: "ABCD",
          requiresAccessCode: true,
          questions: [{ questionId: "q-1", points: 2 }],
        }),
      }),
    );
    vi.useRealTimers();
  });
});
