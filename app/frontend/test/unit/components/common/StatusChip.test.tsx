import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusChip } from "../../../../src/components/common/StatusChip";
import { renderWithProviders } from "../../../utils/render";

describe("StatusChip", () => {
  it("renders the active label when the user is active", () => {
    renderWithProviders(<StatusChip isActive />);

    expect(screen.getByText("common.active")).toBeInTheDocument();
  });

  it("renders the inactive label when the user is inactive", () => {
    renderWithProviders(<StatusChip isActive={false} />);

    expect(screen.getByText("common.inactive")).toBeInTheDocument();
  });
});
