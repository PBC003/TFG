import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SelectedQuizCard } from "../../../../../src/pages/quiz-access/components/SelectedQuizCard";
import type { PublicQuizCatalogItem } from "../../../../../src/types/quiz";
import { renderWithProviders } from "../../../../utils/render";

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
  audienceScope: "PUBLIC" as PublicQuizCatalogItem["audienceScope"],
  requiresAccessCode: true,
  attemptsAllowed: 2,
  attemptsRemaining: 1,
  totalQuestions: 4,
  totalPoints: 10,
  startAt: "2026-04-12T10:00:00.000Z",
  endAt: "2026-04-12T12:00:00.000Z",
  timeLimitMinutes: 30,
  publishedAt: "2026-04-12T09:00:00.000Z",
  isAvailableNow: true,
  canStart: true,
};

describe("SelectedQuizCard", () => {
  it("renders quiz details and delegates actions", () => {
    const onAccessCodeChange = vi.fn();
    const onStart = vi.fn();
    const onLoadBestResult = vi.fn();
    const onResetLookup = vi.fn();

    renderWithProviders(
      <SelectedQuizCard
        quiz={quiz}
        accessCode="AB"
        startDisabled={false}
        loading={false}
        reviewLoading={false}
        canRequestBestResult
        language="es"
        onAccessCodeChange={onAccessCodeChange}
        onStart={onStart}
        onLoadBestResult={onLoadBestResult}
        onResetLookup={onResetLookup}
      />,
    );

    fireEvent.change(screen.getByLabelText("quizAccess.fields.accessCode"), {
      target: { value: "xyz" },
    });
    fireEvent.click(
      screen.getByRole("button", {
        name: "quizAccess.actions.startSelectedQuiz",
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "quizAccess.actions.viewBestResult" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "quizAccess.actions.newLookup" }),
    );

    expect(onAccessCodeChange).toHaveBeenCalledWith("XYZ");
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onLoadBestResult).toHaveBeenCalledTimes(1);
    expect(onResetLookup).toHaveBeenCalledTimes(1);
  });

  it("hides access code field and best-result action when not needed", () => {
    renderWithProviders(
      <SelectedQuizCard
        quiz={{ ...quiz, requiresAccessCode: false }}
        accessCode=""
        startDisabled
        loading={false}
        reviewLoading={false}
        canRequestBestResult={false}
        language="en"
        onAccessCodeChange={vi.fn()}
        onStart={vi.fn()}
        onLoadBestResult={vi.fn()}
        onResetLookup={vi.fn()}
      />,
    );

    expect(
      screen.queryByLabelText("quizAccess.fields.accessCode"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "quizAccess.actions.viewBestResult",
      }),
    ).not.toBeInTheDocument();
  });

  it("renders fallback description, no-time-limit chip and disabled actions", () => {
    renderWithProviders(
      <SelectedQuizCard
        quiz={{
          ...quiz,
          description: "",
          attemptsRemaining: null,
          timeLimitMinutes: null,
          requiresAccessCode: false,
        }}
        accessCode=""
        startDisabled
        loading
        reviewLoading
        canRequestBestResult
        language="en"
        onAccessCodeChange={vi.fn()}
        onStart={vi.fn()}
        onLoadBestResult={vi.fn()}
        onResetLookup={vi.fn()}
      />,
    );

    expect(
      screen.getByText("quizAccess.catalog.noDescription"),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("quizAccess.catalog.noTimeLimit").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", {
        name: "quizAccess.actions.startSelectedQuiz",
      }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "quizAccess.actions.viewBestResult" }),
    ).toBeDisabled();
  });
});
