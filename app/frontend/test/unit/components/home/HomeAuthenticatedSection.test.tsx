import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomeAuthenticatedSection } from "../../../../src/components/home/HomeAuthenticatedSection";
import { createAuthValue } from "../../../utils/auth";
import { renderWithProviders } from "../../../utils/render";

describe("HomeAuthenticatedSection", () => {
  it("renders the current authenticated user information", () => {
    renderWithProviders(<HomeAuthenticatedSection />);

    expect(screen.getByText("home.authenticatedWelcome")).toBeInTheDocument();
    expect(screen.getByText("roles.ADMIN")).toBeInTheDocument();
    expect(screen.getByText("common.active")).toBeInTheDocument();
  });

  it("returns null when there is no authenticated user", () => {
    const authValue = createAuthValue({ user: null, isAuthenticated: false });
    const { container } = renderWithProviders(<HomeAuthenticatedSection />, {
      authValue,
    });

    expect(container).toBeEmptyDOMElement();
  });
});
