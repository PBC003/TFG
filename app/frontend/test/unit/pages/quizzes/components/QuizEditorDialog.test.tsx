import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizEditorDialog } from "../../../../../src/pages/quizzes/components/QuizEditorDialog";
import type { QuestionItem } from "../../../../../src/types/question";
import type { QuizItem } from "../../../../../src/types/quiz";

vi.mock(
  "../../../../../src/pages/quizzes/components/quiz-editor/QuizEditorDialogContent",
  () => ({
    QuizEditorDialogContent: ({ quiz }: { quiz: QuizItem | null }) => (
      <div data-testid="dialog-content">{quiz?.quizId ?? "new"}</div>
    ),
  }),
);

const quiz: QuizItem = {
  quizId: "quiz-1",
  title: "Quiz 1",
  description: null,
  accessCode: null,
  requiresAccessCode: false,
  status: "draft",
  hasAttempts: false,
  canEdit: true,
  canDelete: true,
  attemptsAllowed: 1,
  startAt: null,
  endAt: null,
  timeLimitMinutes: null,
  shuffleQuestions: false,
  revealAnswersAfterClose: false,
  publishedAt: null,
  totalQuestions: 0,
  totalPoints: 0,
  questions: [],
  createdByUserId: 1,
  updatedByUserId: 1,
  version: 1,
  createdAt: "2026-04-12T10:00:00.000Z",
  updatedAt: "2026-04-12T10:00:00.000Z",
};

const questionBank: QuestionItem[] = [];
const commonProps = {
  questionBank,
  submitting: false,
  title: "title",
  description: "description",
  cancelLabel: "cancel",
  saveLabel: "save",
  searchPlaceholder: "search",
  unsupportedTypeLabel: "unsupported",
  questionsSectionTitle: "questions",
  questionPointsLabel: "points",
  noQuestionsLabel: "empty",
  validationMessage: "validation",
  fields: {
    title: "title",
    description: "description",
    accessCode: "accessCode",
    accessCodeHelp: "help",
    accessCodePlaceholder: "placeholder",
    attemptsAllowed: "attempts",
    startAt: "startAt",
    startAtHelper: "startHelper",
    endAt: "endAt",
    endAtHelper: "endHelper",
    timeLimitMinutes: "timeLimit",
    shuffleQuestions: "shuffle",
    revealAnswersAfterClose: "reveal",
    selectedQuestionsCount: "count {{count}}",
    selectedQuestionsFirst: "selected first",
    questionPaginationLabel: "pagination",
    invalidDateRange: "invalid range",
    invalidEndDateInPast: "past",
  },
  onClose: vi.fn(),
  onSubmit: vi.fn(async () => undefined),
};

describe("QuizEditorDialog", () => {
  it("renders dialog content only when open", () => {
    const { rerender } = render(
      <QuizEditorDialog open={false} quiz={null} {...commonProps} />,
    );

    expect(screen.queryByTestId("dialog-content")).not.toBeInTheDocument();

    rerender(<QuizEditorDialog open quiz={quiz} {...commonProps} />);

    expect(screen.getByTestId("dialog-content")).toHaveTextContent("quiz-1");
  });
});
