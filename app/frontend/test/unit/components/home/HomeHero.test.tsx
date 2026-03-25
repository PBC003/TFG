import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeHero } from "../../../../src/components/home/HomeHero";
import { renderWithProviders } from "../../../utils/render";

describe("HomeHero", () => {
  it("renders public actions for guests", () => {
    renderWithProviders(<HomeHero isAuthenticated={false} isAdmin={false} />);

    expect(screen.getByText("home.publicTitle")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "home.ctaLogin" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(
      screen.getByRole("link", { name: "home.ctaRegister" }),
    ).toHaveAttribute("href", "/register");
  });

  it("renders admin actions for authenticated administrators", () => {
    renderWithProviders(<HomeHero isAuthenticated isAdmin />);

    expect(screen.getByText("home.authenticatedTitle")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "home.ctaProfile" }),
    ).toHaveAttribute("href", "/profile");
    expect(screen.getByRole("link", { name: "home.ctaAdmin" })).toHaveAttribute(
      "href",
      "/admin",
    );
  });

  it("does not render the admin shortcut for authenticated non-admin users", () => {
    renderWithProviders(<HomeHero isAuthenticated isAdmin={false} />);

    expect(
      screen.getByRole("link", { name: "home.ctaProfile" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "home.ctaAdmin" }),
    ).not.toBeInTheDocument();
  });
});
