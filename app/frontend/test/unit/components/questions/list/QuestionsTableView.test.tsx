import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuestionsTableView } from "../../../../../src/components/questions/list/QuestionsTableView";
import type { QuestionItem } from "../../../../../src/types/question";

vi.mock("../../../../../src/utils/date", () => ({
  formatDateTime: vi.fn(
    (value: string, locale: string) => `${locale}:${value}`,
  ),
}));
vi.mock(
  "../../../../../src/components/questions/list/QuestionTypeChip",
  () => ({
    QuestionTypeChip: ({ type }: { type: string }) => (
      <span>{`type:${type}`}</span>
    ),
  }),
);
vi.mock("../../../../../src/components/math/MathText", () => ({
  MathText: ({ value }: { value?: string | null }) => (
    <span>{`math:${value ?? ""}`}</span>
  ),
}));

const question: QuestionItem = {
  questionId: "q-1",
  title: "Integral",
  type: "single_choice",
  statement: "\\int x dx",
  explanation: null,
  tags: ["integrales"],
  createdByUserId: 1,
  updatedByUserId: 1,
  version: 3,
  questionConfig: {
    options: [
      { key: "a", text: "uno" },
      { key: "b", text: "dos" },
    ],
    correctOptionKey: "a",
  },
  createdAt: "2026-03-30T10:00:00.000Z",
  updatedAt: "2026-03-30T12:00:00.000Z",
};

describe("QuestionsTableView", () => {
  it("renders the desktop table with math-aware statements and emits edit/delete actions", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <QuestionsTableView
        questions={[question, { ...question, questionId: "q-3", tags: [] }]}
        locale="es"
        headers={{
          title: "Título",
          type: "Tipo",
          tags: "Etiquetas",
          version: "Versión",
          updatedAt: "Actualizada",
          actions: "Acciones",
        }}
        noneLabel="ninguna"
        editLabel="Editar"
        deleteLabel="Borrar"
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText("Título")).toBeInTheDocument();
    expect(screen.getAllByText("type:single_choice")).toHaveLength(2);
    expect(screen.getAllByText("math:\\int x dx")).toHaveLength(2);
    expect(screen.getByText("integrales")).toBeInTheDocument();
    expect(screen.getByText("ninguna")).toBeInTheDocument();
    expect(screen.getAllByText("es:2026-03-30T12:00:00.000Z")).toHaveLength(2);

    await user.click(screen.getAllByRole("button", { name: "Editar" })[0]!);
    await user.click(screen.getAllByRole("button", { name: "Borrar" })[0]!);

    expect(onEdit).toHaveBeenCalledWith(question);
    expect(onDelete).toHaveBeenCalledWith(question);
  });
});
