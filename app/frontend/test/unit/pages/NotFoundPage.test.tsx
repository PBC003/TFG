import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFoundPage from "../../../src/pages/NotFoundPage";
import { renderWithProviders } from "../../utils/render";

describe("NotFoundPage", () => {
  it("renders the 404 state and the home shortcut", () => {
    renderWithProviders(<NotFoundPage />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(
      screen.getByText("errors.codes.common.not_found"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "nav.home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
