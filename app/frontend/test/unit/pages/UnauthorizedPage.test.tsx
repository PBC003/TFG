import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import UnauthorizedPage from "../../../src/pages/UnauthorizedPage";
import { renderWithProviders } from "../../utils/render";

describe("UnauthorizedPage", () => {
  it("renders the unauthorized state and the home shortcut", () => {
    renderWithProviders(<UnauthorizedPage />);

    expect(screen.getByText("auth.unauthorizedTitle")).toBeInTheDocument();
    expect(screen.getByText("auth.unauthorizedBody")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "nav.home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
