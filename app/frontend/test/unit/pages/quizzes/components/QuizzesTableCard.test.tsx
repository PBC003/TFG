import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizzesTableCard } from "../../../../../src/pages/quizzes/components/QuizzesTableCard";
import type { QuizItem } from "../../../../../src/types/quiz";
import { formatDateTime } from "../../../../../src/utils/date";
import { renderWithProviders } from "../../../../utils/render";

vi.mock("../../../../../src/utils/date", () => ({
  formatDateTime: vi.fn(
    (value: string | null, language: string) =>
      `${language}:${value ?? "none"}`,
  ),
}));

const quiz: QuizItem = {
  quizId: "quiz-1",
  title: "Quiz 1",
  description: "Desc",
  accessCode: "ABCD",
  requiresAccessCode: true,
  status: "published",
  hasAttempts: false,
  canEdit: true,
  canDelete: true,
  attemptsAllowed: 2,
  startAt: null,
  endAt: null,
  timeLimitMinutes: 20,
  shuffleQuestions: false,
  revealAnswersAfterClose: false,
  publishedAt: "2026-04-12T09:00:00.000Z",
  totalQuestions: 5,
  totalPoints: 10,
  questions: [],
  createdByUserId: 1,
  updatedByUserId: 1,
  version: 1,
  createdAt: "2026-04-12T10:00:00.000Z",
  updatedAt: "2026-04-12T11:00:00.000Z",
};

describe("QuizzesTableCard", () => {
  it("renders loading and empty states", () => {
    const { rerender } = renderWithProviders(
      <QuizzesTableCard
        loading
        submitting={false}
        quizzes={[]}
        totalQuizzes={0}
        page={0}
        rowsPerPage={5}
        language="es"
        onPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
        onEdit={vi.fn()}
        onCopyLink={vi.fn(async () => undefined)}
        onTogglePublishStatus={vi.fn(async () => undefined)}
        onDelete={vi.fn(async () => undefined)}
      />,
    );

    expect(screen.getByText("common.loading")).toBeInTheDocument();

    rerender(
      <QuizzesTableCard
        loading={false}
        submitting={false}
        quizzes={[]}
        totalQuizzes={0}
        page={0}
        rowsPerPage={5}
        language="es"
        onPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
        onEdit={vi.fn()}
        onCopyLink={vi.fn(async () => undefined)}
        onTogglePublishStatus={vi.fn(async () => undefined)}
        onDelete={vi.fn(async () => undefined)}
      />,
    );

    expect(screen.getByText("quizzes.empty")).toBeInTheDocument();
  });

  it("renders quiz rows and delegates row actions", () => {
    const onEdit = vi.fn();
    const onCopyLink = vi.fn(async () => undefined);
    const onTogglePublishStatus = vi.fn(async () => undefined);
    const onDelete = vi.fn(async () => undefined);

    renderWithProviders(
      <QuizzesTableCard
        loading={false}
        submitting={false}
        quizzes={[quiz]}
        totalQuizzes={1}
        page={0}
        rowsPerPage={5}
        language="es"
        onPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
        onEdit={onEdit}
        onCopyLink={onCopyLink}
        onTogglePublishStatus={onTogglePublishStatus}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText("Quiz 1")).toBeInTheDocument();
    expect(screen.getByText("Desc")).toBeInTheDocument();
    expect(screen.getByText("quizzes.accessCodeRequired")).toBeInTheDocument();
    expect(formatDateTime).toHaveBeenCalledWith(
      "2026-04-12T11:00:00.000Z",
      "es",
    );

    fireEvent.click(screen.getByRole("button", { name: "common.edit" }));
    fireEvent.click(
      screen.getByRole("button", { name: "quizzes.actions.copyLink" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "quizzes.actions.unpublish" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "common.delete" }));

    expect(onEdit).toHaveBeenCalledWith(quiz);
    expect(onCopyLink).toHaveBeenCalledWith(quiz);
    expect(onTogglePublishStatus).toHaveBeenCalledWith(quiz);
    expect(onDelete).toHaveBeenCalledWith(quiz);
  });

  it("shows locked messaging for non-editable quizzes", () => {
    renderWithProviders(
      <QuizzesTableCard
        loading={false}
        submitting={false}
        quizzes={[
          { ...quiz, canEdit: false, canDelete: false, hasAttempts: true },
        ]}
        totalQuizzes={1}
        page={0}
        rowsPerPage={5}
        language="es"
        onPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
        onEdit={vi.fn()}
        onCopyLink={vi.fn(async () => undefined)}
        onTogglePublishStatus={vi.fn(async () => undefined)}
        onDelete={vi.fn(async () => undefined)}
      />,
    );

    expect(screen.getByText("quizzes.lockedByAttempts")).toBeInTheDocument();
  });
});
