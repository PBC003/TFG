import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizReviewCard } from "../../../../../src/pages/quiz-access/components/QuizReviewCard";
import type { QuizSubmissionQuestionReview } from "../../../../../src/types/quiz";
import { renderWithProviders } from "../../../../utils/render";

vi.mock("../../../../../src/components/math/MathText", () => ({
  MathText: ({ value }: { value: string | null }) => <span>{value}</span>,
}));

vi.mock("../../../../../src/pages/quiz-access/utils/quiz-access.utils", () => ({
  formatQuizReviewAnswerValue: vi.fn(
    (_review, value: unknown) => `formatted:${String(value)}`,
  ),
}));

const review: QuizSubmissionQuestionReview = {
  questionId: "q-1",
  title: "Pregunta",
  statement: "Enunciado",
  type: "single_choice",
  points: 2,
  earnedPoints: 1,
  isCorrect: false,
  submittedValue: "a",
  correctValue: "b",
  explanation: "Explicación",
  feedback: "Feedback",
  availableOptions: [
    { key: "a", text: "A" },
    { key: "b", text: "B" },
  ],
};

describe("QuizReviewCard", () => {
  it("renders incorrect answer review with feedback and explanation", () => {
    renderWithProviders(
      <QuizReviewCard review={review} index={0} language="es" />,
    );

    expect(screen.getByText("quizAccess.reviewTitle")).toBeInTheDocument();
    expect(screen.getByText("Pregunta")).toBeInTheDocument();
    expect(screen.getByText("Enunciado")).toBeInTheDocument();
    expect(screen.getByText("quizAccess.incorrectLabel")).toBeInTheDocument();
    expect(screen.getByText(/formatted:a/)).toBeInTheDocument();
    expect(screen.getByText(/formatted:b/)).toBeInTheDocument();
    expect(screen.getByText("Feedback")).toBeInTheDocument();
    expect(screen.getByText("Explicación")).toBeInTheDocument();
  });

  it("renders correct state without optional sections", () => {
    renderWithProviders(
      <QuizReviewCard
        review={{
          ...review,
          isCorrect: true,
          feedback: null,
          explanation: null,
        }}
        index={1}
        language="en"
      />,
    );

    expect(screen.getByText("quizAccess.correctLabel")).toBeInTheDocument();
    expect(screen.queryByText("Feedback")).not.toBeInTheDocument();
    expect(screen.queryByText("Explicación")).not.toBeInTheDocument();
  });
});
