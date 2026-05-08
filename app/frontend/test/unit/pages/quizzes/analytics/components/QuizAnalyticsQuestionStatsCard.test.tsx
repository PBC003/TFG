import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuizAnalyticsQuestionStatsCard } from "../../../../../../src/pages/quizzes/analytics/components/QuizAnalyticsQuestionStatsCard";
import type { QuizAnalyticsQuestionStatsItem } from "../../../../../../src/types/quiz";

const stats: QuizAnalyticsQuestionStatsItem[] = [
  {
    questionId: "q-1",
    title: "Question 1",
    statement: "Statement with $x^2$",
    type: "true_false",
    order: 0,
    maxPoints: 2,
    attempts: 4,
    correctCount: 3,
    incorrectCount: 1,
    unansweredCount: 0,
    averageEarnedPoints: 1.5,
    correctRate: 75,
    answerDistribution: [
      { key: "true", label: "true", count: 3, isCorrect: true },
      { key: "false", label: "false", count: 1, isCorrect: false },
    ],
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
      answerDistribution: "Answer distribution",
      responses: "Responses",
      otherAnswers: "Other",
      getTypeLabel: (type: string) => `type:${type}`,
      getAnswerLabel: (answer: { label: string }) => `answer:${answer.label}`,
    };

    const { rerender } = render(
      <QuizAnalyticsQuestionStatsCard
        title={labels.title}
        stats={[]}
        labels={labels}
        language="es"
      />,
    );

    expect(screen.getByText(labels.title)).toBeInTheDocument();
    expect(screen.queryByText(/Question 1/)).not.toBeInTheDocument();

    rerender(
      <QuizAnalyticsQuestionStatsCard
        title={labels.title}
        stats={stats}
        labels={labels}
        language="es"
      />,
    );

    expect(
      screen.getByText(
        (_, element) => element?.textContent === "Question 1. Question 1",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("type:true_false")).toBeInTheDocument();
    expect(screen.getByText("Statement with")).toBeInTheDocument();
    expect(screen.getAllByText(/75\s*%/).length).toBeGreaterThan(0);
    expect(screen.getByText("1,5 / 2")).toBeInTheDocument();
    expect(screen.getByText("Answer distribution")).toBeInTheDocument();
    expect(screen.getByText("answer:true")).toBeInTheDocument();
    expect(screen.getByText("answer:false")).toBeInTheDocument();
    expect(screen.getByText("Responses")).toBeInTheDocument();
  });

  it("groups long answer distributions into top answers and other", () => {
    const labels = {
      question: "Question",
      attempts: "Attempts",
      correct: "Correct",
      incorrect: "Incorrect",
      unanswered: "Unanswered",
      correctRate: "Correct rate",
      averagePoints: "Average points",
      answerDistribution: "Answer distribution",
      responses: "Responses",
      otherAnswers: "Other",
      getTypeLabel: (type: string) => `type:${type}`,
      getAnswerLabel: (answer: { label: string }) => `answer:${answer.label}`,
    };

    render(
      <QuizAnalyticsQuestionStatsCard
        title="Question stats"
        stats={[
          {
            ...stats[0]!,
            answerDistribution: [
              { key: "a", label: "A", count: 9, isCorrect: null },
              { key: "b", label: "B", count: 8, isCorrect: null },
              { key: "c", label: "C", count: 7, isCorrect: null },
              { key: "d", label: "D", count: 6, isCorrect: null },
              { key: "e", label: "E", count: 5, isCorrect: null },
              { key: "f", label: "F", count: 4, isCorrect: null },
              { key: "g", label: "G", count: 3, isCorrect: null },
            ],
          },
        ]}
        labels={labels}
        language="en"
      />,
    );

    expect(screen.getByText("answer:A")).toBeInTheDocument();
    expect(screen.getByText("answer:E")).toBeInTheDocument();
    expect(screen.getByText("answer:Other")).toBeInTheDocument();
    expect(screen.queryByText("answer:F")).not.toBeInTheDocument();
    expect(screen.queryByText("answer:G")).not.toBeInTheDocument();
  });
});
