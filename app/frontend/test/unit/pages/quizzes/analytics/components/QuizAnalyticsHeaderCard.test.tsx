import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizAnalyticsHeaderCard } from "../../../../../../src/pages/quizzes/analytics/components/QuizAnalyticsHeaderCard";

describe("QuizAnalyticsHeaderCard", () => {
  it("renders metadata and delegates back/export stats actions", () => {
    const onBack = vi.fn();
    const onExportStats = vi.fn();

    render(
      <QuizAnalyticsHeaderCard
        title="Quiz analytics"
        description="Summary"
        onBack={onBack}
        onExportStats={onExportStats}
        backLabel="Back"
        exportStatsLabel="Export stats"
      />,
    );

    expect(screen.getByText("Quiz analytics")).toBeInTheDocument();
    expect(screen.getByText("Summary")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    fireEvent.click(screen.getByRole("button", { name: "Export stats" }));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onExportStats).toHaveBeenCalledTimes(1);
  });
});
