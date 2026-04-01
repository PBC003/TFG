import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { QuestionMathField } from "../../../../../src/components/questions/editor/QuestionMathField";

vi.mock(
  "../../../../../src/components/questions/list/QuestionPreviewCard",
  () => ({
    QuestionPreviewCard: ({
      title,
      content,
      emptyText,
      caption,
      action,
    }: {
      title?: string;
      content?: string | null;
      emptyText?: string;
      caption?: string;
      action?: ReactNode;
    }) => (
      <div>
        <div data-testid="preview-title">{title}</div>
        <div data-testid="preview-content">{content || emptyText}</div>
        <div data-testid="preview-caption">{caption}</div>
        {action}
      </div>
    ),
  }),
);

describe("QuestionMathField", () => {
  it("edits text and toggles preview from edit mode", async () => {
    const user = userEvent.setup();
    const onTogglePreview = vi.fn();
    const onChange = vi.fn();

    render(
      <QuestionMathField
        fieldKey="statement"
        label="Enunciado"
        value="x^2"
        isPreview={false}
        onTogglePreview={onTogglePreview}
        onChange={onChange}
        helperText="latex"
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "questions.dialogs.previewField" }),
    );
    await user.type(screen.getByRole("textbox", { name: "Enunciado" }), "!");

    expect(onTogglePreview).toHaveBeenCalledWith("statement");
    expect(onChange).toHaveBeenLastCalledWith("x^2!");
  });

  it("renders the preview card and toggles back to edit mode", async () => {
    const user = userEvent.setup();
    const onTogglePreview = vi.fn();

    render(
      <QuestionMathField
        fieldKey="statement"
        label="Enunciado"
        value=""
        isPreview
        onTogglePreview={onTogglePreview}
        onChange={vi.fn()}
        helperText="latex"
      />,
    );

    expect(screen.getByTestId("preview-title")).toHaveTextContent("Enunciado");
    expect(screen.getByTestId("preview-content")).toHaveTextContent(
      "questions.dialogs.previewEmpty",
    );
    expect(screen.getByTestId("preview-caption")).toHaveTextContent("latex");

    await user.click(
      screen.getByRole("button", { name: "questions.dialogs.editField" }),
    );
    expect(onTogglePreview).toHaveBeenCalledWith("statement");
  });
});
