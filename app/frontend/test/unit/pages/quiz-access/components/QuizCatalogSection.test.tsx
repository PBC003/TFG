import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PublicQuizCatalogItem } from "../../../../../src/types/quiz";
import { QuizCatalogSection } from "../../../../../src/pages/quiz-access/components/QuizCatalogSection";
import { renderWithProviders } from "../../../../utils/render";

vi.mock("@mui/material", async () => {
  const actual =
    await vi.importActual<typeof import("@mui/material")>("@mui/material");

  return {
    ...actual,
    TablePagination: (props: {
      labelRowsPerPage: string;
      onPageChange: (event: unknown, page: number) => void;
      onRowsPerPageChange: (event: { target: { value: string } }) => void;
    }) => (
      <div data-testid="catalog-pagination">
        <div>{props.labelRowsPerPage}</div>
        <button onClick={() => props.onPageChange({}, 1)}>page</button>
        <button
          onClick={() => props.onRowsPerPageChange({ target: { value: "10" } })}
        >
          rows
        </button>
      </div>
    ),
  };
});

vi.mock(
  "../../../../../src/pages/quiz-access/components/QuizCatalogCard",
  () => ({
    QuizCatalogCard: (props: {
      quiz: PublicQuizCatalogItem;
      onOpen: (quizId: string) => void;
    }) => (
      <div data-testid={`catalog-${props.quiz.quizId}`}>
        <button onClick={() => props.onOpen(props.quiz.quizId)}>
          open-{props.quiz.quizId}
        </button>
      </div>
    ),
  }),
);

const quiz: PublicQuizCatalogItem = {
  quizId: "quiz-1",
  title: "Quiz 1",
  description: "Desc",
  teacherName: "Teacher",
  audienceScope: "PUBLIC" as PublicQuizCatalogItem["audienceScope"],
  requiresAccessCode: false,
  attemptsAllowed: 2,
  attemptsRemaining: 1,
  totalQuestions: 4,
  totalPoints: 8,
  startAt: null,
  endAt: null,
  timeLimitMinutes: null,
  publishedAt: null,
  isAvailableNow: true,
  canStart: true,
};

describe("QuizCatalogSection", () => {
  it("renders loading and empty states", () => {
    const { rerender } = renderWithProviders(
      <QuizCatalogSection
        loading
        search=""
        filteredCatalog={[]}
        paginatedCatalog={[]}
        page={0}
        rowsPerPage={5}
        language="es"
        onSearchChange={vi.fn()}
        onPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
        onOpenQuiz={vi.fn()}
      />,
    );

    expect(screen.getByText("common.loading")).toBeInTheDocument();

    rerender(
      <QuizCatalogSection
        loading={false}
        search=""
        filteredCatalog={[]}
        paginatedCatalog={[]}
        page={0}
        rowsPerPage={5}
        language="es"
        onSearchChange={vi.fn()}
        onPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
        onOpenQuiz={vi.fn()}
      />,
    );

    expect(screen.getByText("quizAccess.catalog.empty")).toBeInTheDocument();
  });

  it("renders visible catalog entries and forwards filters, pagination and open actions", () => {
    const onSearchChange = vi.fn();
    const onPageChange = vi.fn();
    const onRowsPerPageChange = vi.fn();
    const onOpenQuiz = vi.fn();

    renderWithProviders(
      <QuizCatalogSection
        loading={false}
        search="der"
        filteredCatalog={[quiz]}
        paginatedCatalog={[quiz]}
        page={0}
        rowsPerPage={5}
        language="es"
        onSearchChange={onSearchChange}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        onOpenQuiz={onOpenQuiz}
      />,
    );

    fireEvent.change(screen.getByLabelText("quizAccess.catalog.searchLabel"), {
      target: { value: "nuevo" },
    });
    fireEvent.click(screen.getByText("open-quiz-1"));
    fireEvent.click(screen.getByText("page"));
    fireEvent.click(screen.getByText("rows"));

    expect(onSearchChange).toHaveBeenCalledWith("nuevo");
    expect(onOpenQuiz).toHaveBeenCalledWith("quiz-1");
    expect(onPageChange).toHaveBeenCalledWith(1);
    expect(onRowsPerPageChange).toHaveBeenCalledWith(10);
    expect(
      screen.getByText("quizAccess.catalog.paginationLabel"),
    ).toBeInTheDocument();
  });
});
