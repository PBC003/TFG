import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AboutPage from "../../../src/pages/AboutPage";
import NotFoundPage from "../../../src/pages/NotFoundPage";
import UnauthorizedPage from "../../../src/pages/UnauthorizedPage";
import { renderWithProviders } from "../../utils/render";

describe("basic pages", () => {
  it("renders about page content and back home link", () => {
    renderWithProviders(<AboutPage />);

    expect(screen.getByText("about.hero.title")).toBeInTheDocument();
    expect(screen.getByText("about.cards.what.title")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "about.backHome" }),
    ).toHaveAttribute("href", "/");
  });

  it("renders unauthorized page", () => {
    renderWithProviders(<UnauthorizedPage />);

    expect(screen.getByText("auth.unauthorizedTitle")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "nav.home" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders not found page", () => {
    renderWithProviders(<NotFoundPage />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(
      screen.getByText("errors.codes.common.not_found"),
    ).toBeInTheDocument();
  });
});
