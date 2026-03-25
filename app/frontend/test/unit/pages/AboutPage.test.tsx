import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AboutPage from "../../../src/pages/AboutPage";
import { renderWithProviders } from "../../utils/render";

describe("AboutPage", () => {
  it("renders the main content and the back home link", () => {
    renderWithProviders(<AboutPage />);

    expect(screen.getByText("about.hero.title")).toBeInTheDocument();
    expect(screen.getByText("about.cards.what.title")).toBeInTheDocument();
    expect(screen.getByText("about.cards.goal.title")).toBeInTheDocument();
    expect(screen.getByText("about.cards.status.title")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "about.backHome" }),
    ).toHaveAttribute("href", "/");
  });
});
