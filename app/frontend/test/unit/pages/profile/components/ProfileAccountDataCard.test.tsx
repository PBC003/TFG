import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProfileAccountDataCard } from "../../../../../src/pages/profile/components/ProfileAccountDataCard";

const useTranslationMock = vi.fn();
const formatDateTimeMock = vi.fn(
  (value: string, locale: string) => `${value}-${locale}`,
);

vi.mock("react-i18next", () => ({
  useTranslation: () => useTranslationMock(),
}));

vi.mock("../../../../../src/utils/date", () => ({
  formatDateTime: (value: string, locale: string) =>
    formatDateTimeMock(value, locale),
}));

describe("ProfileAccountDataCard", () => {
  it("renders active users using the resolved language", () => {
    useTranslationMock.mockReturnValue({
      t: (key: string) => key,
      i18n: { resolvedLanguage: "en" },
    });

    render(
      <ProfileAccountDataCard
        user={{
          id: 1,
          firstName: "Pablo",
          lastName: "Carrasco",
          email: "pablo@uniovi.es",
          uo: "UO000001",
          role: "ADMIN",
          isActive: true,
          createdAt: "2026-04-10T10:00:00.000Z",
          updatedAt: "2026-04-11T10:00:00.000Z",
        }}
      />,
    );

    expect(screen.getByDisplayValue("Pablo")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Carrasco")).toBeInTheDocument();
    expect(screen.getByDisplayValue("pablo@uniovi.es")).toBeInTheDocument();
    expect(screen.getByDisplayValue("UO000001")).toBeInTheDocument();
    expect(screen.getByDisplayValue("roles.ADMIN")).toBeInTheDocument();
    expect(screen.getByDisplayValue("common.active")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("2026-04-10T10:00:00.000Z-en"),
    ).toBeInTheDocument();
    expect(formatDateTimeMock).toHaveBeenCalledWith(
      "2026-04-10T10:00:00.000Z",
      "en",
    );
  });

  it("falls back to spanish locale and renders inactive users", () => {
    useTranslationMock.mockReturnValue({
      t: (key: string) => key,
      i18n: { resolvedLanguage: undefined },
    });

    render(
      <ProfileAccountDataCard
        user={{
          id: 2,
          firstName: "Ada",
          lastName: "Lovelace",
          email: "ada@uniovi.es",
          uo: "UO000002",
          role: "STUDENT",
          isActive: false,
          createdAt: "2026-04-12T10:00:00.000Z",
          updatedAt: "2026-04-13T10:00:00.000Z",
        }}
      />,
    );

    expect(screen.getByDisplayValue("common.inactive")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("2026-04-12T10:00:00.000Z-es"),
    ).toBeInTheDocument();
    expect(formatDateTimeMock).toHaveBeenCalledWith(
      "2026-04-12T10:00:00.000Z",
      "es",
    );
  });
});
