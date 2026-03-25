import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppFooter } from "../../../../src/components/layout/AppFooter";
import { renderWithProviders } from "../../../utils/render";

describe("AppFooter", () => {
  it("renders application name and important external links", () => {
    renderWithProviders(<AppFooter />);

    expect(screen.getByText("common.appName")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "footer.university" }),
    ).toHaveAttribute("href", "https://www.uniovi.es/");
    expect(
      screen.getByRole("link", { name: "footer.repository" }),
    ).toHaveAttribute("href", "https://github.com/PBC003/TFG");
    expect(screen.getByText("UO289642")).toBeInTheDocument();
  });
});
