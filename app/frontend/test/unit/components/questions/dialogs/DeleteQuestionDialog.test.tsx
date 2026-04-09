import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DeleteQuestionDialog } from "../../../../../src/components/questions/dialogs/DeleteQuestionDialog";
import type { QuestionItem } from "../../../../../src/types/question";

const question: QuestionItem = {
  questionId: "q-1",
  title: "Integral básica",
  type: "true_false",
  statement: "s",
  explanation: null,
  tags: [],
  createdByUserId: 1,
  updatedByUserId: 1,
  version: 1,
  questionConfig: { correctAnswer: true },
  createdAt: "2026-03-30T10:00:00.000Z",
  updatedAt: "2026-03-30T10:00:00.000Z",
};

describe("DeleteQuestionDialog", () => {
  it("shows the selected question and emits close/confirm actions", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <DeleteQuestionDialog
        question={question}
        open
        submitting={false}
        title="Eliminar"
        description="Seguro"
        cancelLabel="Cancelar"
        confirmLabel="Confirmar"
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText("Eliminar")).toBeInTheDocument();
    expect(screen.getByText("Seguro")).toBeInTheDocument();
    expect(screen.getByText("Integral básica")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(onClose).toHaveBeenCalled();
    expect(onConfirm).toHaveBeenCalled();
  });

  it("disables actions while submitting and hides the question title when absent", () => {
    render(
      <DeleteQuestionDialog
        question={null}
        open
        submitting
        title="Eliminar"
        description="Seguro"
        cancelLabel="Cancelar"
        confirmLabel="Confirmar"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.queryByText("Integral básica")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeDisabled();
  });
});
