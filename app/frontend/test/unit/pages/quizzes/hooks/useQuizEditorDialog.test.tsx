import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useQuizEditorDialog } from "../../../../../src/pages/quizzes/hooks/useQuizEditorDialog";

describe("useQuizEditorDialog", () => {
  it("initializes from a quiz, orders/paginates questions and submits a valid payload", async () => {
    const onSubmit = vi.fn((...args: [unknown]) => {
      void args;
      return Promise.resolve();
    });

    const quiz = {
      title: "Quiz 1",
      description: "Desc",
      accessCode: "ABCD",
      requiresAccessCode: true,
      attemptsAllowed: 2,
      startAt: "2099-04-12T10:00:00.000Z",
      endAt: "2099-04-12T11:00:00.000Z",
      timeLimitMinutes: 15,
      shuffleQuestions: true,
      revealAnswersAfterClose: false,
      questions: [
        { questionId: "q-1", points: 2, quantity: 1, toleranceOverride: null },
      ],
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
        title: "Cálculo",
        statement: "S2",
        tags: ["dos"],
        type: "single_choice",
      },
    ];

    const { result } = renderHook(() =>
      useQuizEditorDialog({
        quiz: quiz as never,
        questionBank: questionBank as never,
        validationMessage: "invalid",
        fields: {
          invalidDateRange: "range",
          invalidEndDateInPast: "past",
        } as never,
        onSubmit,
      }),
    );

    expect(result.current.quizTitle).toBe("Quiz 1");
    expect(result.current.selectedQuestionMap.get("q-1")?.points).toBe(2);

    act(() => {
      result.current.setSearch("calc");
      result.current.toggleQuestion(questionBank[1] as never);
      result.current.updateQuestionPoints("q-2", "3");
      result.current.setQuestionRowsPerPage(1);
      result.current.setQuestionPage(0);
      result.current.setQuizTitle("Quiz actualizado");
      result.current.setQuizDescription("Nueva desc");
      result.current.setAccessCode("wxyz");
      result.current.setAttemptsAllowed("4");
      result.current.setStartAt("2099-04-12T10:30");
      result.current.setEndAt("2099-04-12T11:30");
      result.current.setTimeLimitMinutes("20");
      result.current.setShuffleQuestions(false);
      result.current.setRevealAnswersAfterClose(true);
    });

    expect(
      result.current.orderedQuestions.map((question) => question.questionId),
    ).toEqual(["q-2"]);
    expect(result.current.pagedQuestions).toEqual([questionBank[1]]);

    await act(async () => {
      await result.current.submit();
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);

    const firstCall = onSubmit.mock.calls[0];
    expect(firstCall).toBeDefined();

    const payload = firstCall[0] as
      | (Record<string, unknown> & { questions: unknown[] })
      | undefined;

    expect(payload).toBeDefined();

    expect(payload).toEqual(
      expect.objectContaining({
        title: "Quiz actualizado",
        description: "Nueva desc",
        accessCode: "WXYZ",
        requiresAccessCode: true,
        attemptsAllowed: 4,
        shuffleQuestions: false,
        revealAnswersAfterClose: true,
        timeLimitMinutes: 20,
        startAt: new Date("2099-04-12T10:30").toISOString(),
        endAt: new Date("2099-04-12T11:30").toISOString(),
      }),
    );

    expect(payload?.questions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          questionId: "q-1",
          points: 2,
          quantity: 1,
          toleranceOverride: null,
        }),
        expect.objectContaining({
          questionId: "q-2",
          points: 3,
          quantity: 1,
          toleranceOverride: null,
        }),
      ]),
    );
  });

  it("stores local validation messages when the payload is invalid", async () => {
    const onSubmit = vi.fn((...args: [unknown]) => {
      void args;
      return Promise.resolve();
    });

    const questionBank = [
      {
        questionId: "q-1",
        title: "Param",
        statement: "S1",
        tags: [],
        type: "parametric",
        questionConfig: {
          templateId: "series_geometric",
          tolerance: 0.01,
        },
      },
    ];

    const { result } = renderHook(() =>
      useQuizEditorDialog({
        quiz: null,
        questionBank: questionBank as never,
        validationMessage: "invalid",
        fields: {
          invalidDateRange: "range",
          invalidEndDateInPast: "past",
        } as never,
        onSubmit,
      }),
    );

    act(() => {
      result.current.setQuizTitle("ab");
      result.current.toggleQuestion(questionBank[0] as never);
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.localValidationMessage).toBe("invalid");
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
