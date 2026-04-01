import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuestionEditorDialog } from "../../../../../src/components/questions/editor/QuestionEditorDialog";
import type { QuestionItem } from "../../../../../src/types/question";

const mockUseQuestionEditorDialog = vi.fn();

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock(
  "../../../../../src/components/questions/editor/useQuestionEditorDialog",
  () => ({
    useQuestionEditorDialog: (...args: unknown[]) =>
      mockUseQuestionEditorDialog(...args),
  }),
);

vi.mock(
  "../../../../../src/components/questions/editor/QuestionEditorDialogContent",
  () => ({
    QuestionEditorDialogContent: (props: { formError: string | null }) => (
      <div data-testid="dialog-content">{props.formError ?? "sin-error"}</div>
    ),
  }),
);

vi.mock(
  "../../../../../src/components/questions/editor/QuestionEditorDialogActions",
  () => ({
    QuestionEditorDialogActions: (props: {
      questionId?: string;
      submitting: boolean;
    }) => (
      <div data-testid="dialog-actions">
        {props.questionId ?? "create"}:{String(props.submitting)}
      </div>
    ),
  }),
);

const question: QuestionItem = {
  questionId: "q-1",
  title: "Pregunta",
  type: "true_false",
  statement: "Enunciado",
  explanation: null,
  tags: [],
  createdByUserId: 1,
  updatedByUserId: 1,
  version: 1,
  questionConfig: { correctAnswer: true },
  createdAt: "2026-03-30T10:00:00.000Z",
  updatedAt: "2026-03-30T10:00:00.000Z",
};

describe("QuestionEditorDialog", () => {
  it("renders create and edit modes and delegates to the editor hook", () => {
    mockUseQuestionEditorDialog.mockReturnValue({
      form: {
        type: "true_false",
      },
      formError: "error-editor",
      previewFields: {},
      updateForm: vi.fn(),
      togglePreviewField: vi.fn(),
      handleAddTag: vi.fn(),
      updateSingleChoiceOption: vi.fn(),
      updateMultipleChoiceOption: vi.fn(),
      addSingleChoiceOption: vi.fn(),
      addMultipleChoiceOption: vi.fn(),
      removeSingleChoiceOption: vi.fn(),
      removeMultipleChoiceOption: vi.fn(),
      handleSubmit: vi.fn(),
    });

    const onClose = vi.fn();
    const onSubmit = vi.fn(async () => undefined);
    const { rerender } = render(
      <QuestionEditorDialog
        open
        question={null}
        submitting={false}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    expect(
      screen.getByText("questions.dialogs.createTitle"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("dialog-content")).toHaveTextContent(
      "error-editor",
    );
    expect(screen.getByTestId("dialog-actions")).toHaveTextContent(
      "create:false",
    );

    rerender(
      <QuestionEditorDialog
        open
        question={question}
        submitting
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByText("questions.dialogs.editTitle")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-actions")).toHaveTextContent("q-1:true");
    expect(mockUseQuestionEditorDialog).toHaveBeenCalled();
  });
});
