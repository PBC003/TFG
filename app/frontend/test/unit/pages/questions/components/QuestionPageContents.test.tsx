import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuestionsPageContent } from "../../../../../src/pages/questions/components/QuestionsPageContent";
import type { QuestionItem } from "../../../../../src/types/question";
import { renderWithProviders } from "../../../../utils/render";

vi.mock(
  "../../../../../src/components/questions/list/QuestionsMobileList",
  () => ({
    QuestionsMobileList: () => <div data-testid="mobile-list" />,
  }),
);

vi.mock(
  "../../../../../src/components/questions/list/QuestionsTableView",
  () => ({
    QuestionsTableView: () => <div data-testid="table-view" />,
  }),
);

const question: QuestionItem = {
  questionId: "q-1",
  title: "Question 1",
  type: "true_false",
  statement: "Statement",
  explanation: null,
  tags: [],
  createdByUserId: 1,
  updatedByUserId: 1,
  version: 1,
  questionConfig: { correctAnswer: true },
  createdAt: "2026-04-12T10:00:00.000Z",
  updatedAt: "2026-04-12T10:00:00.000Z",
};

describe("QuestionsPageContent", () => {
  it("renders loading and empty states", () => {
    const { rerender } = renderWithProviders(
      <QuestionsPageContent
        loading
        isMobile={false}
        questions={[]}
        locale="es"
        noneLabel="none"
        loadingLabel="loading"
        emptyLabel="empty"
        editLabel="edit"
        deleteLabel="delete"
        tableHeaders={{
          title: "title",
          type: "type",
          tags: "tags",
          version: "version",
          updatedAt: "updated",
          actions: "actions",
        }}
        lastUpdatedLabel={(value) => value}
        page={0}
        rowsPerPage={5}
        totalQuestions={0}
        rowsPerPageLabel="rows"
        displayedRowsLabel={() => "displayed"}
        onPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("loading")).toBeInTheDocument();

    rerender(
      <QuestionsPageContent
        loading={false}
        isMobile={false}
        questions={[]}
        locale="es"
        noneLabel="none"
        loadingLabel="loading"
        emptyLabel="empty"
        editLabel="edit"
        deleteLabel="delete"
        tableHeaders={{
          title: "title",
          type: "type",
          tags: "tags",
          version: "version",
          updatedAt: "updated",
          actions: "actions",
        }}
        lastUpdatedLabel={(value) => value}
        page={0}
        rowsPerPage={5}
        totalQuestions={0}
        rowsPerPageLabel="rows"
        displayedRowsLabel={() => "displayed"}
        onPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("empty")).toBeInTheDocument();
  });

  it("renders mobile and desktop content branches", () => {
    const onPageChange = vi.fn();
    const onRowsPerPageChange = vi.fn();
    const { rerender } = renderWithProviders(
      <QuestionsPageContent
        loading={false}
        isMobile
        questions={[question]}
        locale="es"
        noneLabel="none"
        loadingLabel="loading"
        emptyLabel="empty"
        editLabel="edit"
        deleteLabel="delete"
        tableHeaders={{
          title: "title",
          type: "type",
          tags: "tags",
          version: "version",
          updatedAt: "updated",
          actions: "actions",
        }}
        lastUpdatedLabel={(value) => value}
        page={0}
        rowsPerPage={5}
        totalQuestions={1}
        rowsPerPageLabel="rows"
        displayedRowsLabel={() => "displayed"}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByTestId("mobile-list")).toBeInTheDocument();

    rerender(
      <QuestionsPageContent
        loading={false}
        isMobile={false}
        questions={[question]}
        locale="es"
        noneLabel="none"
        loadingLabel="loading"
        emptyLabel="empty"
        editLabel="edit"
        deleteLabel="delete"
        tableHeaders={{
          title: "title",
          type: "type",
          tags: "tags",
          version: "version",
          updatedAt: "updated",
          actions: "actions",
        }}
        lastUpdatedLabel={(value) => value}
        page={0}
        rowsPerPage={5}
        totalQuestions={1}
        rowsPerPageLabel="rows"
        displayedRowsLabel={() => "displayed"}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByTestId("table-view")).toBeInTheDocument();
    expect(screen.getByText("rows")).toBeInTheDocument();
    expect(screen.getByText("displayed")).toBeInTheDocument();
    expect(onPageChange).not.toHaveBeenCalled();
    expect(onRowsPerPageChange).not.toHaveBeenCalled();
  });
});
