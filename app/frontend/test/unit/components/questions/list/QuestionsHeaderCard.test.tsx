import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuestionsHeaderCard } from "../../../../../src/components/questions/list/QuestionsHeaderCard";

describe("QuestionsHeaderCard", () => {
  it("fires refresh and create actions", async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();
    const onCreate = vi.fn();

    render(
      <QuestionsHeaderCard
        title="Preguntas"
        subtitle="Sub"
        refreshLabel="Refrescar"
        createLabel="Crear"
        loading={false}
        submitting={false}
        onRefresh={onRefresh}
        onCreate={onCreate}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Refrescar" }));
    await user.click(screen.getByRole("button", { name: "Crear" }));

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it("disables actions when loading or submitting", () => {
    const { rerender } = render(
      <QuestionsHeaderCard
        title="Preguntas"
        subtitle="Sub"
        refreshLabel="Refrescar"
        createLabel="Crear"
        loading
        submitting={false}
        onRefresh={vi.fn()}
        onCreate={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Refrescar" })).toBeDisabled();

    rerender(
      <QuestionsHeaderCard
        title="Preguntas"
        subtitle="Sub"
        refreshLabel="Refrescar"
        createLabel="Crear"
        loading={false}
        submitting
        onRefresh={vi.fn()}
        onCreate={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Crear" })).toBeDisabled();
  });
});
