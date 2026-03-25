import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminToolbar } from "../../../../src/components/admin/AdminToolbar";
import { renderWithProviders } from "../../../utils/render";

describe("AdminToolbar", () => {
  it("emits search and filter changes and shows visible count", () => {
    const onSearchChange = vi.fn();
    const onStatusFilterChange = vi.fn();

    renderWithProviders(
      <AdminToolbar
        search=""
        statusFilter="all"
        totalVisible={7}
        onSearchChange={onSearchChange}
        onStatusFilterChange={onStatusFilterChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("common.search"), {
      target: { value: "pablo" },
    });
    expect(onSearchChange).toHaveBeenCalledWith("pablo");

    fireEvent.mouseDown(
      screen.getByRole("combobox", { name: "admin.stateFilter" }),
    );
    fireEvent.click(screen.getByRole("option", { name: "common.active" }));
    expect(onStatusFilterChange).toHaveBeenCalledWith("active");

    expect(screen.getByText("admin.totalUsers: 7")).toBeInTheDocument();
  });
});
