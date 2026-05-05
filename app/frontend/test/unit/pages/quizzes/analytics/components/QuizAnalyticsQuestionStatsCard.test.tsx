import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuizAnalyticsQuestionStatsCard } from "../../../../../../src/pages/quizzes/analytics/components/QuizAnalyticsQuestionStatsCard";
import type { QuizAnalyticsQuestionStatsItem } from "../../../../../../src/types/quiz";

const stats: QuizAnalyticsQuestionStatsItem[] = [
  {
    questionId: "q-1",
    title: "Question 1",
    type: "true_false",
    order: 0,
    maxPoints: 2,
    attempts: 4,
    correctCount: 3,
    incorrectCount: 1,
    unansweredCount: 0,
    averageEarnedPoints: 1.5,
    correctRate: 75,
  },
];

describe("QuizAnalyticsQuestionStatsCard", () => {
  it("renders populated question statistics", () => {
    const labels = {
      title: "Question stats",
      question: "Question",
      attempts: "Attempts",
      correct: "Correct",
      incorrect: "Incorrect",
      unanswered: "Unanswered",
      correctRate: "Correct rate",
      averagePoints: "Average points",
      getTypeLabel: (type: string) => `type:${type}`,
    };

    const { rerender } = render(
      <QuizAnalyticsQuestionStatsCard
        title={labels.title}
        stats={[]}
        labels={labels}
      />,
    );

    expect(screen.getByText(labels.title)).toBeInTheDocument();
    expect(screen.queryByText(/Question 1/)).not.toBeInTheDocument();

    rerender(
      <QuizAnalyticsQuestionStatsCard
        title={labels.title}
        stats={stats}
        labels={labels}
      />,
    );

    expect(
      screen.getByText(
        (_, element) => element?.textContent === "0. Question 1",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("type:true_false")).toBeInTheDocument();
    expect(screen.getByText(/75\s*%/)).toBeInTheDocument();
    expect(screen.getByText("1.5 / 2")).toBeInTheDocument();
  });
});
