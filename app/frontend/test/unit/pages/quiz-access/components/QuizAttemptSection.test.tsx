import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizAttemptSection } from "../../../../../src/pages/quiz-access/components/QuizAttemptSection";
import type { QuizAttemptItem } from "../../../../../src/types/quiz";
import { renderWithProviders } from "../../../../utils/render";

vi.mock(
  "../../../../../src/pages/quiz-access/components/QuizAttemptQuestionCard",
  () => ({
    QuizAttemptQuestionCard: (props: {
      index: number;
      question: { questionId: string };
      onChange: (value: unknown) => void;
    }) => (
      <div data-testid={`question-${props.question.questionId}`}>
        <span>{props.index}</span>
        <button onClick={() => props.onChange(true)}>answer</button>
      </div>
    ),
  }),
);

const attempt: QuizAttemptItem = {
  attemptId: "attempt-1",
  quizId: "quiz-1",
  title: "Intento",
  description: null,
  accessCode: null,
  participantName: "Pablo",
  attemptNumber: 1,
  attemptsAllowed: 2,
  attemptsRemaining: 1,
  status: "in_progress",
  startedAt: "2026-04-12T10:00:00.000Z",
  expiresAt: null,
  questions: [
    {
      questionId: "q-1",
      title: "P1",
      type: "true_false",
      statement: "A",
      explanation: null,
      tags: [],
      points: 1,
      order: 1,
      questionConfig: {},
    },
    {
      questionId: "q-2",
      title: "P2",
      type: "true_false",
      statement: "B",
      explanation: null,
      tags: [],
      points: 2,
      order: 2,
      questionConfig: {},
    },
  ],
};

describe("QuizAttemptSection", () => {
  it("renders all questions and submit action", () => {
    const onAnswerChange = vi.fn();
    const onSubmit = vi.fn();

    renderWithProviders(
      <QuizAttemptSection
        attempt={attempt}
        answers={{}}
        submitting={false}
        language="es"
        onAnswerChange={onAnswerChange}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByTestId("question-q-1")).toBeInTheDocument();
    expect(screen.getByTestId("question-q-2")).toBeInTheDocument();
    expect(
      screen.getByText("quizAccess.questionCountSummary"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getAllByText("answer")[0]!);
    fireEvent.click(
      screen.getByRole("button", { name: "quizAccess.actions.submitAttempt" }),
    );

    expect(onAnswerChange).toHaveBeenCalledWith("q-1", true);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("disables submit while there are invalid parametric answers", () => {
    const onAnswerChange = vi.fn();
    const onSubmit = vi.fn();

    renderWithProviders(
      <QuizAttemptSection
        attempt={{
          ...attempt,
          questions: [
            {
              questionId: "q-param",
              title: "Param",
              type: "parametric",
              statement: "Param",
              explanation: null,
              tags: [],
              points: 1,
              order: 1,
              questionConfig: { inputPlaceholder: "", tolerance: 0.1 },
            },
          ],
        }}
        answers={{ "q-param": "sin(2)" }}
        submitting={false}
        language="es"
        onAnswerChange={onAnswerChange}
        onSubmit={onSubmit}
      />,
    );

    expect(
      screen.getByText("quizAccess.parametricAnswerValidation.summary"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "quizAccess.actions.submitAttempt" }),
    ).toBeDisabled();
  });
});
