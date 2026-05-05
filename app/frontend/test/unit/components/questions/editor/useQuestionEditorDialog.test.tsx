import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useQuestionEditorDialog } from "../../../../../src/components/questions/editor/useQuestionEditorDialog";
import type { QuestionItem } from "../../../../../src/types/question";
import { createT } from "../../../../utils/i18n";

const question: QuestionItem = {
  questionId: "q-1",
  title: "Integral",
  type: "single_choice",
  statement: "\\int x dx",
  explanation: "general",
  tags: ["integrales"],
  createdByUserId: 1,
  updatedByUserId: 1,
  version: 1,
  questionConfig: {
    options: [
      { key: "a", text: "uno", feedback: null },
      { key: "b", text: "dos", feedback: "pista" },
    ],
    correctOptionKey: "a",
  },
  createdAt: "2026-03-30T10:00:00.000Z",
  updatedAt: "2026-03-30T10:00:00.000Z",
};

function Harness({
  onSubmit,
  currentQuestion = question,
}: {
  onSubmit: (payload: unknown) => Promise<void>;
  currentQuestion?: QuestionItem | null;
}) {
  const editor = useQuestionEditorDialog({
    question: currentQuestion,
    onSubmit,
    t: createT(),
  });
  return (
    <div>
      <div data-testid="title">{editor.form.title}</div>
      <div data-testid="tags">{editor.form.tags.join(",")}</div>
      <div data-testid="preview">
        {String(editor.previewFields.statement ?? false)}
      </div>
      <div data-testid="single-count">
        {editor.form.singleChoice.options.length}
      </div>
      <div data-testid="multiple-count">
        {editor.form.multipleChoice.options.length}
      </div>
      <div data-testid="single-correct">
        {editor.form.singleChoice.options
          .map((o) => `${o.key}:${o.isCorrect}`)
          .join(",")}
      </div>
      <div data-testid="multiple-correct">
        {editor.form.multipleChoice.options
          .map((o) => `${o.key}:${o.isCorrect}`)
          .join(",")}
      </div>
      <div data-testid="error">{editor.formError ?? "none"}</div>
      <button
        onClick={() =>
          editor.updateForm((current) => ({ ...current, newTag: "  series " }))
        }
      >
        set-new-tag
      </button>
      <button onClick={() => editor.handleAddTag()}>add-tag</button>
      <button onClick={() => editor.togglePreviewField("statement")}>
        toggle-preview
      </button>
      <button
        onClick={() => editor.updateSingleChoiceOption(1, "isCorrect", true)}
      >
        single-correct
      </button>
      <button
        onClick={() => editor.updateMultipleChoiceOption(1, "isCorrect", true)}
      >
        multiple-correct
      </button>
      <button onClick={() => editor.addSingleChoiceOption()}>add-single</button>
      <button onClick={() => editor.addMultipleChoiceOption()}>
        add-multiple
      </button>
      <button onClick={() => editor.removeSingleChoiceOption(0)}>
        remove-single
      </button>
      <button onClick={() => editor.removeMultipleChoiceOption(0)}>
        remove-multiple
      </button>
      <button
        onClick={() => editor.updateSingleChoiceOption(1, "text", "tres")}
      >
        fill-single
      </button>
      <button
        onClick={() =>
          editor.updateForm((current) => ({
            ...current,
            title: "abc",
            statement: "ok",
            explanation: "  detalle  ",
            tags: [" integrales ", "series", "integrales"],
          }))
        }
      >
        prepare-submit
      </button>
      <button onClick={() => void editor.handleSubmit()}>submit</button>
      <button
        onClick={() =>
          editor.updateForm((current) => ({ ...current, title: "ab" }))
        }
      >
        invalidate
      </button>
    </div>
  );
}

describe("useQuestionEditorDialog", () => {
  it("manages preview, options, tags and payload submission", () => {
    const onSubmit = vi.fn(async () => undefined);
    render(<Harness onSubmit={onSubmit} />);
    expect(screen.getByTestId("title")).toHaveTextContent("Integral");
    fireEvent.click(screen.getByRole("button", { name: "toggle-preview" }));
    expect(screen.getByTestId("preview")).toHaveTextContent("true");
    fireEvent.click(screen.getByRole("button", { name: "set-new-tag" }));
    fireEvent.click(screen.getByRole("button", { name: "add-tag" }));
    expect(screen.getByTestId("tags")).toHaveTextContent("integrales,series");
    fireEvent.click(screen.getByRole("button", { name: "single-correct" }));
    expect(screen.getByTestId("single-correct")).toHaveTextContent(
      "a:false,b:true",
    );
    fireEvent.click(screen.getByRole("button", { name: "multiple-correct" }));
    expect(screen.getByTestId("multiple-correct")).toHaveTextContent("b:true");
    fireEvent.click(screen.getByRole("button", { name: "add-single" }));
    fireEvent.click(screen.getByRole("button", { name: "add-multiple" }));
    expect(screen.getByTestId("single-count")).toHaveTextContent("3");
    expect(screen.getByTestId("multiple-count")).toHaveTextContent("3");
    fireEvent.click(screen.getByRole("button", { name: "remove-single" }));
    fireEvent.click(screen.getByRole("button", { name: "remove-multiple" }));
    expect(screen.getByTestId("single-count")).toHaveTextContent("2");
    expect(screen.getByTestId("multiple-count")).toHaveTextContent("2");
    expect(screen.getByTestId("multiple-correct")).toHaveTextContent("b:true");
    fireEvent.click(screen.getByRole("button", { name: "fill-single" }));
    fireEvent.click(screen.getByRole("button", { name: "prepare-submit" }));
    fireEvent.click(screen.getByRole("button", { name: "submit" }));
    expect(onSubmit).toHaveBeenCalledWith({
      title: "abc",
      type: "single_choice",
      statement: "ok",
      explanation: "detalle",
      tags: ["integrales", "series"],
      questionConfig: {
        options: [
          { key: "b", text: "dos", feedback: "pista" },
          { key: "c", text: "tres", feedback: null },
        ],
        correctOptionKey: "b",
        randomizeOptions: false,
      },
    });
    expect(screen.getByTestId("error")).toHaveTextContent("none");
  }, 10000);

  it("stores validation errors instead of submitting invalid forms", () => {
    const onSubmit = vi.fn(async () => undefined);
    render(<Harness onSubmit={onSubmit} currentQuestion={null} />);
    fireEvent.click(screen.getByRole("button", { name: "invalidate" }));
    fireEvent.click(screen.getByRole("button", { name: "submit" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByTestId("error")).toHaveTextContent(
      "questions.dialogs.titleValidation",
    );
  });
});
