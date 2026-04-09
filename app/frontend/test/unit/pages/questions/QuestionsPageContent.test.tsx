import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuestionsPageContent } from "../../../../src/pages/questions/components/QuestionsPageContent";
import type { QuestionItem } from "../../../../src/types/question";

vi.mock(
  "../../../../src/components/questions/list/QuestionsMobileList",
  () => ({
    QuestionsMobileList: ({ questions }: { questions: QuestionItem[] }) => (
      <div data-testid="mobile-list">
        {questions.map((q) => q.questionId).join(",")}
      </div>
    ),
  }),
);

vi.mock("../../../../src/components/questions/list/QuestionsTableView", () => ({
  QuestionsTableView: ({ questions }: { questions: QuestionItem[] }) => (
    <div data-testid="table-view">
      {questions.map((q) => q.questionId).join(",")}
    </div>
  ),
}));

const question: QuestionItem = {
  questionId: "q-1",
  title: "Integral",
  type: "true_false",
  statement: "\\int x dx",
  explanation: null,
  tags: [],
  createdByUserId: 1,
  updatedByUserId: 1,
  version: 1,
  questionConfig: { correctAnswer: true },
  createdAt: "2026-03-30T10:00:00.000Z",
  updatedAt: "2026-03-30T10:00:00.000Z",
};

const baseProps = {
  locale: "es",
  noneLabel: "none",
  loadingLabel: "loading",
  emptyLabel: "empty",
  editLabel: "edit",
  deleteLabel: "delete",
  tableHeaders: {
    title: "title",
    type: "type",
    tags: "tags",
    version: "version",
    updatedAt: "updatedAt",
    actions: "actions",
  },
  lastUpdatedLabel: (value: string) => value,
  page: 0,
  rowsPerPage: 10,
  totalQuestions: 1,
  rowsPerPageLabel: "rows per page",
  displayedRowsLabel: (from: number, to: number, count: number) =>
    `${from}-${to}-${count}`,
  onPageChange: vi.fn(),
  onRowsPerPageChange: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
};

describe("QuestionsPageContent", () => {
  it("shows loading and empty states before rendering lists", () => {
    const { rerender } = render(
      <QuestionsPageContent
        {...baseProps}
        loading
        isMobile={false}
        questions={[]}
        totalQuestions={0}
      />,
    );

    expect(screen.getByText("loading")).toBeInTheDocument();

    rerender(
      <QuestionsPageContent
        {...baseProps}
        loading={false}
        isMobile={false}
        questions={[]}
        totalQuestions={0}
      />,
    );

    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("renders the mobile and table variants according to the screen mode", () => {
    const { rerender } = render(
      <QuestionsPageContent
        {...baseProps}
        loading={false}
        isMobile
        questions={[question]}
      />,
    );

    expect(screen.getByTestId("mobile-list")).toHaveTextContent("q-1");
    expect(screen.getByText("rows per page")).toBeInTheDocument();

    rerender(
      <QuestionsPageContent
        {...baseProps}
        loading={false}
        isMobile={false}
        questions={[question]}
      />,
    );

    expect(screen.getByTestId("table-view")).toHaveTextContent("q-1");
  });
});
