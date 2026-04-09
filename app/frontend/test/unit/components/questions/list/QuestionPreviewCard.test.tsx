import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuestionPreviewCard } from "../../../../../src/components/questions/list/QuestionPreviewCard";

vi.mock("../../../../../src/components/math/MathText", () => ({
  MathText: ({
    value,
    emptyText,
  }: {
    value?: string | null;
    emptyText?: string;
  }) => <div data-testid="math-text">{value || emptyText}</div>,
}));

describe("QuestionPreviewCard", () => {
  it("renders content, caption and action", () => {
    render(
      <QuestionPreviewCard
        title="Vista previa"
        content="x^2"
        emptyText="vacío"
        caption="pie"
        action={<button>acción</button>}
      />,
    );

    expect(screen.getByText("Vista previa")).toBeInTheDocument();
    expect(screen.getByTestId("math-text")).toHaveTextContent("x^2");
    expect(screen.getByText("pie")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "acción" })).toBeInTheDocument();
  });

  it("falls back to the empty text when there is no content", () => {
    render(<QuestionPreviewCard emptyText="vacío" />);
    expect(screen.getByTestId("math-text")).toHaveTextContent("vacío");
  });
});
