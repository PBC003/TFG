import { createElement } from "react";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "../../../src/pages/HomePage";
import { renderWithProviders } from "../../utils/render";
import { createAuthValue } from "../../utils/auth";

vi.mock("../../../src/components/home/HomeHero.tsx", () => ({
  HomeHero: ({
    isAuthenticated,
    isAdmin,
  }: {
    isAuthenticated: boolean;
    isAdmin: boolean;
  }) =>
    createElement(
      "div",
      null,
      `hero-${String(isAuthenticated)}-${String(isAdmin)}`,
    ),
}));

vi.mock("../../../src/components/home/HomeAuthenticatedSection.tsx", () => ({
  HomeAuthenticatedSection: () =>
    createElement("div", null, "authenticated-section"),
}));

vi.mock("../../../src/components/home/HomePublicSection.tsx", () => ({
  HomePublicSection: () => createElement("div", null, "public-section"),
}));

describe("HomePage", () => {
  it("renders public home for anonymous users", () => {
    renderWithProviders(createElement(HomePage), {
      authValue: createAuthValue({
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        status: "anonymous",
      }),
    });

    expect(screen.getByText("hero-false-false")).toBeInTheDocument();
    expect(screen.getByText("public-section")).toBeInTheDocument();
  });

  it("renders authenticated home for signed in users", () => {
    renderWithProviders(createElement(HomePage));

    expect(screen.getByText("hero-true-true")).toBeInTheDocument();
    expect(screen.getByText("authenticated-section")).toBeInTheDocument();
  });
});
