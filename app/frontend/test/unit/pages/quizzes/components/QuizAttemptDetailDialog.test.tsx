import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizAttemptDetailDialog } from "../../../../../src/pages/quizzes/components/QuizAttemptDetailDialog";
import type { QuizAttemptReviewDetail } from "../../../../../src/types/quiz";

const detail: QuizAttemptReviewDetail = {
  attemptId: "attempt-1",
  quizId: "quiz-1",
  title: "Quiz 1",
  participantName: "user:1",
  participantDisplayName: "Ada Lovelace",
  attemptNumber: 2,
  status: "submitted",
  startedAt: "2026-04-12T10:00:00.000Z",
  submittedAt: "2026-04-12T10:05:00.000Z",
  expiresAt: null,
  earnedPoints: 8,
  maxPoints: 10,
  scoreOverTen: 8,
  review: [
    {
      questionId: "q-1",
      title: "Question 1",
      statement: "x^2",
      type: "parametric",
      points: 2,
      earnedPoints: 2,
      isCorrect: true,
      submittedValue: "x=2",
      correctValue: "x=2",
      explanation: "Explain",
      feedback: "Good",
      availableOptions: null,
    },
    {
      questionId: "q-2",
      title: "Question 2",
      statement: "Statement",
      type: "multiple_choice",
      points: 3,
      earnedPoints: 0,
      isCorrect: false,
      submittedValue: [],
      correctValue: ["A"],
      explanation: null,
      feedback: null,
      availableOptions: [{ key: "A", text: "Option A" }],
    },
  ],
};

describe("QuizAttemptDetailDialog", () => {
  it("renders detail metadata, review entries and closes the dialog", () => {
    const onClose = vi.fn();

    render(
      <QuizAttemptDetailDialog
        detail={detail}
        language="es"
        onClose={onClose}
      />,
    );

    expect(screen.getByText("Quiz 1")).toBeInTheDocument();
    expect(
      screen.getByText("quizAnalytics.participantValue"),
    ).toBeInTheDocument();
    expect(screen.getByText("quizAnalytics.rawScoreValue")).toBeInTheDocument();
    expect(screen.getByText("Good")).toBeInTheDocument();
    expect(
      screen.getAllByText("quizAccess.notAnswered").length,
    ).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "common.close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("stays closed when no detail is provided", () => {
    render(
      <QuizAttemptDetailDialog
        detail={null}
        language="es"
        onClose={() => undefined}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders expired attempts and answered boolean reviews without feedback", () => {
    render(
      <QuizAttemptDetailDialog
        detail={{
          ...detail,
          status: "expired",
          review: [
            {
              questionId: "q-3",
              title: "Question 3",
              statement: "Statement 3",
              type: "true_false",
              points: 1,
              earnedPoints: 0,
              isCorrect: false,
              submittedValue: false,
              correctValue: true,
              explanation: null,
              feedback: null,
              availableOptions: null,
            },
          ],
        }}
        language="es"
        onClose={() => undefined}
      />,
    );

    expect(
      screen.getByText("quizAnalytics.status.expired"),
    ).toBeInTheDocument();
    expect(screen.getByText("quizAccess.incorrectLabel")).toBeInTheDocument();
    expect(screen.getByText("questions.answers.false")).toBeInTheDocument();
    expect(screen.getByText("questions.answers.true")).toBeInTheDocument();
  });
});
