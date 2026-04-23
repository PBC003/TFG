import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizAnalyticsHeaderCard } from "../../../../../../src/pages/quizzes/analytics/components/QuizAnalyticsHeaderCard";

describe("QuizAnalyticsHeaderCard", () => {
  it("renders metadata and delegates back/export actions", () => {
    const onBack = vi.fn();
    const onExport = vi.fn();

    render(
      <QuizAnalyticsHeaderCard
        title="Quiz analytics"
        description="Summary"
        exportDisabled={false}
        onBack={onBack}
        onExport={onExport}
        backLabel="Back"
        exportLabel="Export"
      />,
    );

    expect(screen.getByText("Quiz analytics")).toBeInTheDocument();
    expect(screen.getByText("Summary")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    fireEvent.click(screen.getByRole("button", { name: "Export" }));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it("disables export when requested", () => {
    render(
      <QuizAnalyticsHeaderCard
        title="Quiz analytics"
        description="Summary"
        exportDisabled
        onBack={() => undefined}
        onExport={() => undefined}
        backLabel="Back"
        exportLabel="Export"
      />,
    );

    expect(screen.getByRole("button", { name: "Export" })).toBeDisabled();
  });
});
