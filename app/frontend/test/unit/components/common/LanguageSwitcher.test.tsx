import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LanguageSwitcher } from "../../../../src/components/common/LanguageSwitcher";
import { mockI18n } from "../../../setup";
import { renderWithProviders } from "../../../utils/render";

describe("LanguageSwitcher", () => {
  it("does not change the language when the current option is selected again", () => {
    mockI18n.resolvedLanguage = "es";
    renderWithProviders(<LanguageSwitcher />);

    fireEvent.click(screen.getByRole("button", { name: "Español" }));

    expect(mockI18n.changeLanguage).not.toHaveBeenCalled();
  });

  it("changes the language when a different option is selected", () => {
    mockI18n.resolvedLanguage = "es";
    renderWithProviders(<LanguageSwitcher />);

    fireEvent.click(screen.getByRole("button", { name: "English" }));

    expect(mockI18n.changeLanguage).toHaveBeenCalledWith("en");
  });

  it("normalizes english regional variants to en", () => {
    mockI18n.resolvedLanguage = "en-US";
    renderWithProviders(<LanguageSwitcher />);

    expect(
      screen
        .getByRole("button", { name: "English" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });
});
