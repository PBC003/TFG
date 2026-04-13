import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizActiveAttemptHeaderCard } from "../../../../../src/pages/quiz-access/components/QuizActiveAttemptHeaderCard";
import type { QuizAttemptItem } from "../../../../../src/types/quiz";
import { renderWithProviders } from "../../../../utils/render";

vi.mock("../../../../../src/pages/quiz-access/utils/quiz-access.utils", () => ({
  formatRemainingTime: vi.fn(() => "remaining-time"),
}));

const attempt: QuizAttemptItem = {
  attemptId: "attempt-1",
  quizId: "quiz-1",
  title: "Intento activo",
  description: "Descripción",
  accessCode: "ABCD",
  participantName: "Pablo",
  attemptNumber: 2,
  attemptsAllowed: 4,
  attemptsRemaining: 2,
  status: "in_progress",
  startedAt: "2026-04-12T10:00:00.000Z",
  expiresAt: "2026-04-12T11:00:00.000Z",
  questions: [],
};

describe("QuizActiveAttemptHeaderCard", () => {
  it("renders title, optional description and status chips", () => {
    renderWithProviders(
      <QuizActiveAttemptHeaderCard attempt={attempt} nowMs={0} />,
    );

    expect(screen.getByText("Intento activo")).toBeInTheDocument();
    expect(screen.getByText("Descripción")).toBeInTheDocument();
    expect(screen.getByText("quizAccess.attemptTag")).toBeInTheDocument();
    expect(
      screen.getByText("quizAccess.remainingAttemptsTag"),
    ).toBeInTheDocument();
    expect(screen.getByText("remaining-time")).toBeInTheDocument();
  });

  it("omits description when not provided", () => {
    renderWithProviders(
      <QuizActiveAttemptHeaderCard
        attempt={{ ...attempt, description: null, expiresAt: null }}
        nowMs={0}
      />,
    );

    expect(screen.queryByText("Descripción")).not.toBeInTheDocument();
    expect(screen.getByText("remaining-time")).toBeInTheDocument();
  });
});
