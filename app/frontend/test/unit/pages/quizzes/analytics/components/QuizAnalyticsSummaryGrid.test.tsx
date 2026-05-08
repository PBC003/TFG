import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuizAnalyticsSummaryGrid } from "../../../../../../src/pages/quizzes/analytics/components/QuizAnalyticsSummaryGrid";

describe("QuizAnalyticsSummaryGrid", () => {
  it("renders every summary item", () => {
    render(
      <QuizAnalyticsSummaryGrid
        language="es"
        items={[
          { label: "Attempts", value: 4 },
          { label: "Average", value: 8.5 },
        ]}
      />,
    );

    expect(screen.getByText("Attempts")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("Average")).toBeInTheDocument();
    expect(screen.getByText("8,5")).toBeInTheDocument();
  });
});
