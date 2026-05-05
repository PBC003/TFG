import { describe, expect, it } from "vitest";
import {
  QUIZ_ROWS_PER_PAGE_OPTIONS,
  filterAndSortQuizCatalog,
  formatQuizReviewAnswerValue,
  formatRemainingTime,
  getPublicQuestionOptions,
  normalizeQuizAccessSearch,
  paginateQuizCatalog,
} from "../../../../../src/pages/quiz-access/utils/quiz-access.utils";
import { createT } from "../../../../utils/i18n";

describe("quiz access utils", () => {
  const t = createT();
  const quizzes = [
    {
      quizId: "quiz-b",
      title: "Álgebra",
      description: "Descripción",
      teacherName: "Ada",
      requiresAccessCode: false,
      attemptsAllowed: 2,
      attemptsRemaining: 1,
      totalQuestions: 2,
      totalPoints: 5,
      startAt: null,
      endAt: null,
      timeLimitMinutes: null,
      publishedAt: "2026-04-12T10:00:00.000Z",
      isAvailableNow: true,
      canStart: true,
    },
    {
      quizId: "quiz-a",
      title: "Cálculo",
      description: "Integrales",
      teacherName: "Pablo",
      requiresAccessCode: true,
      attemptsAllowed: 1,
      attemptsRemaining: 0,
      totalQuestions: 3,
      totalPoints: 6,
      startAt: null,
      endAt: null,
      timeLimitMinutes: 10,
      publishedAt: "2026-04-12T11:00:00.000Z",
      isAvailableNow: true,
      canStart: false,
    },
  ];

  it("normalizes search text, filters, sorts and paginates the public catalog", () => {
    expect(QUIZ_ROWS_PER_PAGE_OPTIONS).toEqual([5, 10, 20]);
    expect(normalizeQuizAccessSearch(" Cálculo_{x} ")).toBe(" calculo  x  ");

    expect(
      filterAndSortQuizCatalog(quizzes as never, "", "quiz-b").map(
        (quiz) => quiz.quizId,
      ),
    ).toEqual(["quiz-b", "quiz-a"]);
    expect(
      filterAndSortQuizCatalog(quizzes as never, "integrales", undefined).map(
        (quiz) => quiz.quizId,
      ),
    ).toEqual(["quiz-a"]);
    expect(paginateQuizCatalog(quizzes, 1, 1)).toEqual([quizzes[1]]);
  });

  it("formats timers, review answers and public options", () => {
    const now = new Date("2026-04-12T10:00:00.000Z").getTime();
    expect(formatRemainingTime(null, now, t)).toBe("quizAccess.noTimeLimit");
    expect(formatRemainingTime("2026-04-12T10:01:15.000Z", now, t)).toBe(
      "quizAccess.timerValue",
    );

    expect(
      formatQuizReviewAnswerValue(
        { type: "true_false", availableOptions: null } as never,
        true,
        t,
      ),
    ).toBe("questions.answers.true");
    expect(
      formatQuizReviewAnswerValue(
        {
          type: "single_choice",
          availableOptions: [{ key: "a", text: "Option A" }],
        } as never,
        "a",
        t,
      ),
    ).toBe("Option A");
    expect(
      formatQuizReviewAnswerValue(
        {
          type: "multiple_choice",
          availableOptions: [
            { key: "a", text: "A" },
            { key: "b", text: "B" },
          ],
        } as never,
        ["a", "b"],
        t,
      ),
    ).toBe("A, B");
    expect(
      formatQuizReviewAnswerValue(
        { type: "single_choice", availableOptions: null } as never,
        null,
        t,
      ),
    ).toBe("quizAccess.notAnswered");

    expect(
      getPublicQuestionOptions({
        questionConfig: { options: [{ key: "a", text: "A" }] },
      } as never),
    ).toEqual([{ key: "a", text: "A" }]);
    expect(getPublicQuestionOptions({ questionConfig: {} } as never)).toEqual(
      [],
    );
  });

  it("covers remaining review-formatting branches and expired timers", () => {
    const now = new Date("2026-04-12T10:00:00.000Z").getTime();

    expect(formatRemainingTime("2026-04-12T09:59:00.000Z", now, t)).toBe(
      "quizAccess.timerValue",
    );

    expect(
      formatQuizReviewAnswerValue(
        { type: "true_false", availableOptions: null } as never,
        false,
        t,
      ),
    ).toBe("questions.answers.false");
    expect(
      formatQuizReviewAnswerValue(
        { type: "true_false", availableOptions: null } as never,
        null,
        t,
      ),
    ).toBe("quizAccess.notAnswered");
    expect(
      formatQuizReviewAnswerValue(
        {
          type: "multiple_choice",
          availableOptions: [{ key: "a", text: "A" }],
        } as never,
        [],
        t,
      ),
    ).toBe("quizAccess.notAnswered");
    expect(
      formatQuizReviewAnswerValue(
        {
          type: "multiple_choice",
          availableOptions: [{ key: "a", text: "A" }],
        } as never,
        ["a", 2],
        t,
      ),
    ).toBe("A");
    expect(
      formatQuizReviewAnswerValue(
        { type: "parametric", availableOptions: null } as never,
        "  x+1  ",
        t,
      ),
    ).toBe("x+1");
    expect(
      formatQuizReviewAnswerValue(
        { type: "parametric", availableOptions: null } as never,
        "   ",
        t,
      ),
    ).toBe("quizAccess.notAnswered");
    expect(
      formatQuizReviewAnswerValue(
        { type: "unknown", availableOptions: null } as never,
        "value",
        t,
      ),
    ).toBe("quizAccess.notAnswered");
  });
});
