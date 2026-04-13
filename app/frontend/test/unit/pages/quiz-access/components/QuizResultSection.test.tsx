import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizResultSection } from "../../../../../src/pages/quiz-access/components/QuizResultSection";
import type { QuizSubmissionResult } from "../../../../../src/types/quiz";
import { formatDateTime } from "../../../../../src/utils/date";
import { renderWithProviders } from "../../../../utils/render";

vi.mock("../../../../../src/utils/date", () => ({
  formatDateTime: vi.fn(
    (value: string, language: string) => `${language}:${value}`,
  ),
}));

vi.mock(
  "../../../../../src/pages/quiz-access/components/QuizReviewCard",
  () => ({
    QuizReviewCard: ({ review }: { review: { questionId: string } }) => (
      <div data-testid={`review-${review.questionId}`} />
    ),
  }),
);

const result: QuizSubmissionResult = {
  attemptId: "attempt-1",
  quizId: "quiz-1",
  title: "Resultado",
  participantName: "Pablo",
  attemptNumber: 1,
  attemptsAllowed: 2,
  attemptsRemaining: 1,
  status: "submitted",
  submittedAt: "2026-04-12T12:00:00.000Z",
  earnedPoints: 8,
  maxPoints: 10,
  scoreOverTen: 8,
  canRevealFeedback: true,
  revealBlockedByEndDate: false,
  review: [
    {
      questionId: "q-1",
      title: "P1",
      statement: "A",
      type: "true_false",
      points: 1,
      earnedPoints: 1,
      isCorrect: true,
      submittedValue: true,
      correctValue: true,
      explanation: null,
      feedback: null,
      availableOptions: null,
    },
  ],
};

describe("QuizResultSection", () => {
  it("renders review cards and action buttons when feedback is visible", () => {
    const onNewLookup = vi.fn();
    const onStartAnotherAttempt = vi.fn();

    renderWithProviders(
      <QuizResultSection
        result={result}
        language="es"
        starting={false}
        onNewLookup={onNewLookup}
        onStartAnotherAttempt={onStartAnotherAttempt}
      />,
    );

    expect(screen.getByText("Resultado")).toBeInTheDocument();
    expect(formatDateTime).toHaveBeenCalledWith(
      "2026-04-12T12:00:00.000Z",
      "es",
    );
    expect(screen.getByTestId("review-q-1")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "quizAccess.actions.newLookup" }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "quizAccess.actions.startAnotherAttempt",
      }),
    );

    expect(onNewLookup).toHaveBeenCalledTimes(1);
    expect(onStartAnotherAttempt).toHaveBeenCalledTimes(1);
  });

  it("renders blocked feedback message and hides retry button when no attempts remain", () => {
    renderWithProviders(
      <QuizResultSection
        result={{
          ...result,
          canRevealFeedback: false,
          revealBlockedByEndDate: true,
          attemptsRemaining: 0,
        }}
        language="es"
        starting={false}
        onNewLookup={vi.fn()}
        onStartAnotherAttempt={vi.fn()}
      />,
    );

    expect(
      screen.getByText("quizAccess.feedbackBlockedUntilEndDate"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "quizAccess.actions.startAnotherAttempt",
      }),
    ).not.toBeInTheDocument();
  });
});
