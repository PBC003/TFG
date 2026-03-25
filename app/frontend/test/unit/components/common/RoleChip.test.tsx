import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RoleChip } from "../../../../src/components/common/RoleChip";
import { renderWithProviders } from "../../../utils/render";

describe("RoleChip", () => {
  it("renders the admin label", () => {
    renderWithProviders(<RoleChip role="ADMIN" />);

    expect(screen.getByText("roles.ADMIN")).toBeInTheDocument();
  });

  it("renders the teacher label", () => {
    renderWithProviders(<RoleChip role="TEACHER" />);

    expect(screen.getByText("roles.TEACHER")).toBeInTheDocument();
  });

  it("renders the student label", () => {
    renderWithProviders(<RoleChip role="STUDENT" />);

    expect(screen.getByText("roles.STUDENT")).toBeInTheDocument();
  });
});
