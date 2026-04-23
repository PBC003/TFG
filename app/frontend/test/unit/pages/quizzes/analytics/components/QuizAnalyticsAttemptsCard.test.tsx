import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizAnalyticsAttemptsCard } from "../../../../../../src/pages/quizzes/analytics/components/QuizAnalyticsAttemptsCard";
import type { QuizAnalyticsAttemptItem } from "../../../../../../src/types/quiz";

const attempt: QuizAnalyticsAttemptItem = {
  attemptId: "attempt-1",
  quizId: "quiz-1",
  participantName: "user:1",
  participantDisplayName: "Ada Lovelace",
  attemptNumber: 1,
  status: "submitted",
  startedAt: "2026-04-12T10:00:00.000Z",
  submittedAt: "2026-04-12T10:05:00.000Z",
  expiresAt: null,
  earnedPoints: 7,
  maxPoints: 10,
  scoreOverTen: 7,
  questionCount: 3,
};

const labels = {
  title: "Attempts",
  subtitle: "Subtitle",
  searchPlaceholder: "Search",
  empty: "Empty",
  searchEmpty: "No matches",
  participant: "Participant",
  attempt: "Attempt",
  status: "Status",
  startedAt: "Started",
  submittedAt: "Submitted",
  score: "Score",
  viewDetail: "View",
  rowsPerPage: "Rows",
  actions: "Actions",
};

describe("QuizAnalyticsAttemptsCard", () => {
  it("renders empty states", () => {
    const { rerender } = render(
      <QuizAnalyticsAttemptsCard
        loading={false}
        detailLoading={false}
        allAttemptsCount={0}
        filteredAttemptsCount={0}
        attempts={[]}
        attemptSearch=""
        attemptsPage={0}
        attemptsRowsPerPage={5}
        language="es"
        labels={labels}
        onSearchChange={() => undefined}
        onPageChange={() => undefined}
        onRowsPerPageChange={() => undefined}
        onOpenDetail={() => undefined}
        getStatusLabel={(status) => status}
      />,
    );

    expect(screen.getByText("Empty")).toBeInTheDocument();

    rerender(
      <QuizAnalyticsAttemptsCard
        loading={false}
        detailLoading={false}
        allAttemptsCount={1}
        filteredAttemptsCount={0}
        attempts={[]}
        attemptSearch="ada"
        attemptsPage={0}
        attemptsRowsPerPage={5}
        language="es"
        labels={labels}
        onSearchChange={() => undefined}
        onPageChange={() => undefined}
        onRowsPerPageChange={() => undefined}
        onOpenDetail={() => undefined}
        getStatusLabel={(status) => status}
      />,
    );

    expect(screen.getByText("No matches")).toBeInTheDocument();
  });

  it("renders attempts and delegates table interactions", () => {
    const onSearchChange = vi.fn();
    const onPageChange = vi.fn();
    const onRowsPerPageChange = vi.fn();
    const onOpenDetail = vi.fn();

    render(
      <QuizAnalyticsAttemptsCard
        loading={false}
        detailLoading={false}
        allAttemptsCount={6}
        filteredAttemptsCount={6}
        attempts={[attempt]}
        attemptSearch=""
        attemptsPage={0}
        attemptsRowsPerPage={5}
        language="es"
        labels={labels}
        onSearchChange={onSearchChange}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        onOpenDetail={onOpenDetail}
        getStatusLabel={(status) => `status:${status}`}
      />,
    );

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("status:submitted")).toBeInTheDocument();
    expect(screen.getByText("7 / 10")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: "Ada" },
    });
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    fireEvent.click(screen.getByLabelText("Go to next page"));

    expect(onSearchChange).toHaveBeenCalledWith("Ada");
    expect(onOpenDetail).toHaveBeenCalledWith("attempt-1");
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
