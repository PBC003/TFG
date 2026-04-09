import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuestionsFiltersCard } from "../../../../../src/components/questions/list/QuestionsFiltersCard";

describe("QuestionsFiltersCard", () => {
  it("updates search and filter callbacks", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    const onTypeFilterChange = vi.fn();

    render(
      <QuestionsFiltersCard
        searchLabel="Buscar"
        searchValue=""
        onSearchChange={onSearchChange}
        typeFilterLabel="Tipo"
        typeFilterValue="all"
        onTypeFilterChange={onTypeFilterChange}
        typeFilters={["all", "single_choice"]}
        getTypeLabel={(value) => value}
        totalVisibleText="2 visibles"
      />,
    );

    await user.type(screen.getByRole("textbox", { name: "Buscar" }), "int");
    await user.click(screen.getByRole("combobox", { name: "Tipo" }));
    await user.click(screen.getByRole("option", { name: "single_choice" }));

    expect(onSearchChange).toHaveBeenCalled();
    expect(onTypeFilterChange).toHaveBeenCalledWith("single_choice");
    expect(screen.getByText("2 visibles")).toBeInTheDocument();
  });
});
