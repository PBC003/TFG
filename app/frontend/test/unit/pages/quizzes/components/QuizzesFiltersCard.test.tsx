import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizzesFiltersCard } from "../../../../../src/pages/quizzes/components/QuizzesFiltersCard";
import { renderWithProviders } from "../../../../utils/render";

describe("QuizzesFiltersCard", () => {
  it("updates search and status filters", () => {
    const onSearchChange = vi.fn();
    const onStatusFilterChange = vi.fn();

    renderWithProviders(
      <QuizzesFiltersCard
        search="der"
        statusFilter="all"
        visibleCount={3}
        onSearchChange={onSearchChange}
        onStatusFilterChange={onStatusFilterChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("quizzes.searchPlaceholder"), {
      target: { value: "nuevo" },
    });
    fireEvent.mouseDown(
      screen.getByRole("combobox", { name: "quizzes.statusFilter" }),
    );
    fireEvent.click(
      screen.getByRole("option", { name: "quizzes.status.published" }),
    );

    expect(onSearchChange).toHaveBeenCalledWith("nuevo");
    expect(onStatusFilterChange).toHaveBeenCalledWith("published");
    expect(screen.getByText("quizzes.totalVisible")).toBeInTheDocument();
  });
});
