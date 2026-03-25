import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingScreen } from "../../../../src/components/common/LoadingScreen";
import { renderWithProviders } from "../../../utils/render";

describe("LoadingScreen", () => {
  it("renders the session loading translation key", () => {
    renderWithProviders(<LoadingScreen />);

    expect(screen.getByText("auth.sessionLoading")).toBeInTheDocument();
  });
});
