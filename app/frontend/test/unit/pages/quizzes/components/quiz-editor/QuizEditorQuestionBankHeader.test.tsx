import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { QuizEditorQuestionBankHeader } from "../../../../../../src/pages/quizzes/components/quiz-editor/QuizEditorQuestionBankHeader";

describe("QuizEditorQuestionBankHeader", () => {
  it("renders the summary and forwards search changes", () => {
    const onSearchChange = vi.fn();

    render(
      <QuizEditorQuestionBankHeader
        questionsSectionTitle="Question bank"
        fields={
          {
            selectedQuestionsCount: "Selected: {{count}}",
            selectedQuestionsFirst: "Select questions first",
          } as never
        }
        totalSelectedSlots={3}
        searchPlaceholder="Search"
        search=""
        submitting={false}
        loading={false}
        onSearchChange={onSearchChange}
      />,
    );

    expect(screen.getByText("Question bank")).toBeInTheDocument();
    expect(screen.getByText("Selected: 3")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search"), {
      target: { value: "limits" },
    });
    expect(onSearchChange).toHaveBeenCalledWith("limits");
  });
});
