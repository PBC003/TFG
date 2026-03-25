import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomePublicSection } from "../../../../src/components/home/HomePublicSection";
import { renderWithProviders } from "../../../utils/render";

describe("HomePublicSection", () => {
  it("renders the public feature titles", () => {
    renderWithProviders(<HomePublicSection />);

    expect(
      screen.getByText("home.publicFeaturePracticeTitle"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("home.publicFeatureAccessTitle"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("home.publicFeatureProfileTitle"),
    ).toBeInTheDocument();
  });

  it("renders the public feature descriptions", () => {
    renderWithProviders(<HomePublicSection />);

    expect(
      screen.getByText("home.publicFeaturePracticeBody"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("home.publicFeatureAccessBody"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("home.publicFeatureProfileBody"),
    ).toBeInTheDocument();
  });
});
