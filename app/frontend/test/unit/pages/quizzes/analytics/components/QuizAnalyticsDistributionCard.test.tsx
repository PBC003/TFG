import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuizAnalyticsDistributionCard } from "../../../../../../src/pages/quizzes/analytics/components/QuizAnalyticsDistributionCard";
import type { QuizAnalyticsItem } from "../../../../../../src/types/quiz";

const analytics: QuizAnalyticsItem = {
  quizId: "quiz-1",
  title: "Quiz",
  description: null,
  status: "published",
  hasAttempts: true,
  generatedAt: "2026-04-12T10:00:00.000Z",
  summary: {
    totalAttempts: 4,
    completedAttempts: 4,
    submittedAttempts: 3,
    expiredAttempts: 1,
    inProgressAttempts: 0,
    uniqueParticipants: 3,
    averageScoreOverTen: 7,
    bestScoreOverTen: 9,
    worstScoreOverTen: 4,
  },
  scoreDistribution: [
    { label: "0 - 4.99", minScore: 0, maxScore: 4.99, count: 1 },
    { label: "5 - 6.99", minScore: 5, maxScore: 6.99, count: 2 },
    { label: "7 - 8.99", minScore: 7, maxScore: 8.99, count: 1 },
  ],
  attempts: [],
  questionStats: [],
};

describe("QuizAnalyticsDistributionCard", () => {
  it("renders buckets with fallback and translated labels", () => {
    render(
      <QuizAnalyticsDistributionCard
        title="Distribution"
        labels={["Failed", "Pass"]}
        analytics={analytics}
      />,
    );

    expect(screen.getByText("Distribution")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("Pass")).toBeInTheDocument();
    expect(screen.getByText("7 - 8.99")).toBeInTheDocument();
    expect(screen.getByText("5 - 6.99 · 2")).toBeInTheDocument();
  });

  it("renders zero-width buckets when every bucket count is zero", () => {
    render(
      <QuizAnalyticsDistributionCard
        title="Zero"
        labels={[]}
        analytics={{
          ...analytics,
          scoreDistribution: [
            { label: "0 - 4.99", minScore: 0, maxScore: 4.99, count: 0 },
            { label: "5 - 6.99", minScore: 5, maxScore: 6.99, count: 0 },
          ],
        }}
      />,
    );

    const progressBars = screen.getAllByRole("progressbar");
    progressBars.forEach((bar) =>
      expect(bar).toHaveAttribute("aria-valuenow", "0"),
    );
  });
});
