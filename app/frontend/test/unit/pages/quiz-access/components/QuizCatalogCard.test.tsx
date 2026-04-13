import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizCatalogCard } from "../../../../../src/pages/quiz-access/components/QuizCatalogCard";
import type { PublicQuizCatalogItem } from "../../../../../src/types/quiz";
import { renderWithProviders } from "../../../../utils/render";

import { formatDateTime } from "../../../../../src/utils/date";

vi.mock("../../../../../src/utils/date", () => ({
  formatDateTime: vi.fn(
    (value: string | null, language: string) =>
      `${language}:${value ?? "none"}`,
  ),
}));

const quiz: PublicQuizCatalogItem = {
  quizId: "quiz-1",
  title: "Quiz 1",
  description: "Desc",
  teacherName: "Teacher",
  requiresAccessCode: true,
  attemptsAllowed: 3,
  attemptsRemaining: 2,
  totalQuestions: 4,
  totalPoints: 10,
  startAt: "2026-04-12T10:00:00.000Z",
  endAt: "2026-04-12T12:00:00.000Z",
  timeLimitMinutes: 15,
  publishedAt: "2026-04-12T09:00:00.000Z",
  isAvailableNow: true,
  canStart: true,
};

describe("QuizCatalogCard", () => {
  it("renders quiz metadata and opens selected quiz", () => {
    const onOpen = vi.fn();

    renderWithProviders(
      <QuizCatalogCard quiz={quiz} language="es" isSelected onOpen={onOpen} />,
    );

    expect(screen.getByText("Quiz 1")).toBeInTheDocument();
    expect(screen.getByText("Desc")).toBeInTheDocument();
    expect(
      screen.getByText("quizAccess.catalog.requiresCode"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("quizAccess.catalog.availableNow"),
    ).toBeInTheDocument();
    expect(formatDateTime).toHaveBeenCalledWith(
      "2026-04-12T10:00:00.000Z",
      "es",
    );
    expect(formatDateTime).toHaveBeenCalledWith(
      "2026-04-12T12:00:00.000Z",
      "es",
    );

    fireEvent.click(
      screen.getByRole("button", { name: "quizAccess.catalog.startButton" }),
    );

    expect(onOpen).toHaveBeenCalledWith("quiz-1");
  });

  it("renders fallback labels for open access and unknown attempts", () => {
    renderWithProviders(
      <QuizCatalogCard
        quiz={{
          ...quiz,
          description: null,
          requiresAccessCode: false,
          attemptsRemaining: null,
          isAvailableNow: false,
          timeLimitMinutes: null,
        }}
        language="en"
        isSelected={false}
        onOpen={vi.fn()}
      />,
    );

    expect(
      screen.getByText("quizAccess.catalog.noDescription"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("quizAccess.catalog.openAccess"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("quizAccess.catalog.notAvailableNow"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("quizAccess.catalog.noTimeLimit"),
    ).toBeInTheDocument();
  });
});
