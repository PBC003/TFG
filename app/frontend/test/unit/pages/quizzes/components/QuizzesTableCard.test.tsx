import { fireEvent, screen, within } from "@testing-library/react";
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
  audienceScope: "all",
  totalQuestions: 5,
  totalPoints: 10,
  questions: [],
  assignedGroupIds: [],
  assignedGroups: [],
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
        onOpenAnalytics={vi.fn()}
        onStartSimulation={vi.fn()}
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
        onOpenAnalytics={vi.fn()}
        onStartSimulation={vi.fn()}
      />,
    );

    expect(screen.getByText("quizzes.empty")).toBeInTheDocument();
  });

  it("renders quiz rows and delegates row actions", () => {
    const onEdit = vi.fn();
    const onCopyLink = vi.fn(async () => undefined);
    const onTogglePublishStatus = vi.fn(async () => undefined);
    const onDelete = vi.fn(async () => undefined);
    const onOpenAnalytics = vi.fn();
    const onStartSimulation = vi.fn();

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
        onOpenAnalytics={onOpenAnalytics}
        onStartSimulation={onStartSimulation}
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
      screen.getByRole("button", { name: "quizzes.actions.simulate" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "quizzes.actions.copyLink" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "quizzes.actions.unpublish" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "common.delete" }));

    expect(onEdit).toHaveBeenCalledWith(quiz);
    expect(onStartSimulation).toHaveBeenCalledWith(quiz);
    expect(onCopyLink).toHaveBeenCalledWith(quiz);
    expect(onTogglePublishStatus).toHaveBeenCalledWith(quiz);
    expect(onDelete).toHaveBeenCalledWith(quiz);
    expect(
      screen.getByRole("button", { name: "quizzes.actions.analytics" }),
    ).toBeDisabled();
  });

  it("shows alternative labels, group chips and enabled analytics for draft quizzes", () => {
    const onOpenAnalytics = vi.fn();
    const onPageChange = vi.fn();
    const onRowsPerPageChange = vi.fn();

    renderWithProviders(
      <QuizzesTableCard
        loading={false}
        submitting={false}
        quizzes={[
          {
            ...quiz,
            quizId: "quiz-2",
            title: "Draft quiz",
            description: null,
            requiresAccessCode: false,
            accessCode: null,
            status: "draft",
            hasAttempts: true,
            canEdit: false,
            canDelete: false,
            timeLimitMinutes: null,
            assignedGroups: [
              { groupId: "g-1", name: "G1" },
              { groupId: "g-2", name: "G2" },
              { groupId: "g-3", name: "G3" },
            ],
            assignedGroupIds: ["g-1", "g-2", "g-3"],
          },
        ]}
        totalQuizzes={6}
        page={0}
        rowsPerPage={5}
        language="es"
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        onEdit={vi.fn()}
        onCopyLink={vi.fn(async () => undefined)}
        onTogglePublishStatus={vi.fn(async () => undefined)}
        onDelete={vi.fn(async () => undefined)}
        onOpenAnalytics={onOpenAnalytics}
        onStartSimulation={vi.fn()}
      />,
    );

    expect(screen.getByText("quizzes.directLinkOnly")).toBeInTheDocument();
    expect(screen.getByText("quizzes.noTimeLimit")).toBeInTheDocument();
    expect(screen.getByText("quizzes.lockedByAttempts")).toBeInTheDocument();
    expect(screen.getByText("quizzes.audience.groups")).toBeInTheDocument();
    expect(screen.getByText("G1")).toBeInTheDocument();
    expect(screen.getByText("G2")).toBeInTheDocument();
    expect(screen.queryByText("G3")).not.toBeInTheDocument();

    const publishButton = screen.getByRole("button", {
      name: "quizzes.actions.publish",
    });
    const analyticsButton = screen.getByRole("button", {
      name: "quizzes.actions.analytics",
    });

    expect(screen.getByRole("button", { name: "common.edit" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "common.delete" }),
    ).toBeDisabled();

    fireEvent.click(analyticsButton);
    fireEvent.click(screen.getByLabelText("Go to next page"));

    const rowsSelect = screen.getByRole("combobox", {
      name: "quizzes.pagination.rowsPerPage",
    });
    fireEvent.mouseDown(rowsSelect);
    fireEvent.click(screen.getByRole("option", { name: "10" }));

    expect(onOpenAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({ quizId: "quiz-2" }),
    );
    expect(onPageChange).toHaveBeenCalledWith(1);
    expect(onRowsPerPageChange).toHaveBeenCalledWith(10);
    expect(publishButton).not.toBeDisabled();
  });

  it("shows published lock messaging and disables submit-sensitive actions while submitting", () => {
    renderWithProviders(
      <QuizzesTableCard
        loading={false}
        submitting
        quizzes={[
          {
            ...quiz,
            quizId: "quiz-3",
            title: "Published locked quiz",
            canEdit: false,
            canDelete: true,
            hasAttempts: false,
          },
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
        onOpenAnalytics={vi.fn()}
        onStartSimulation={vi.fn()}
      />,
    );

    const row = screen.getByRole("row", { name: /Published locked quiz/i });
    const rowWithin = within(row);

    expect(
      screen.getByText("quizzes.lockedWhilePublished"),
    ).toBeInTheDocument();
    expect(
      rowWithin.getByRole("button", { name: "common.edit" }),
    ).toBeDisabled();
    expect(
      rowWithin.getByRole("button", { name: "quizzes.actions.unpublish" }),
    ).toBeDisabled();
    expect(
      rowWithin.getByRole("button", { name: "common.delete" }),
    ).toBeDisabled();
  });
});
