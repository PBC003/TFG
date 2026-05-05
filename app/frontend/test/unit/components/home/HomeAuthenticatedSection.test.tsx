import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeAuthenticatedSection } from "../../../../src/components/home/HomeAuthenticatedSection";
import { createAuthValue } from "../../../utils/auth";
import { renderWithProviders } from "../../../utils/render";

describe("HomeAuthenticatedSection", () => {
  it("renders the current authenticated user information and admin quick actions", () => {
    renderWithProviders(<HomeAuthenticatedSection />);

    expect(screen.getByText("home.authenticatedWelcome")).toBeInTheDocument();
    expect(screen.getByText("roles.ADMIN")).toBeInTheDocument();
    expect(screen.getByText("common.active")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "nav.questions" })).toHaveAttribute(
      "href",
      "/questions",
    );
    expect(
      screen.queryByRole("link", { name: "nav.profile" }),
    ).not.toBeInTheDocument();
  });

  it("renders student quick actions when the user cannot manage content", () => {
    const authValue = createAuthValue({
      user: {
        ...createAuthValue().user!,
        role: "STUDENT",
      },
      isAdmin: false,
    });

    renderWithProviders(<HomeAuthenticatedSection />, { authValue });

    expect(screen.getByRole("link", { name: "nav.profile" })).toHaveAttribute(
      "href",
      "/profile",
    );
    expect(
      screen.queryByRole("link", { name: "nav.questions" }),
    ).not.toBeInTheDocument();
  });

  it("returns null when there is no authenticated user", () => {
    const authValue = createAuthValue({ user: null, isAuthenticated: false });
    const { container } = renderWithProviders(<HomeAuthenticatedSection />, {
      authValue,
    });

    expect(container).toBeEmptyDOMElement();
  });
});
