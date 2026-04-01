import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuestionTagsEditor } from "../../../../../src/components/questions/editor/QuestionTagsEditor";

describe("QuestionTagsEditor", () => {
  it("updates and adds tags from input actions", async () => {
    const user = userEvent.setup();
    const onNewTagChange = vi.fn();
    const onAddTag = vi.fn();

    render(
      <QuestionTagsEditor
        label="Etiquetas"
        newTagLabel="Nueva"
        newTagValue=""
        onNewTagChange={onNewTagChange}
        onAddTag={onAddTag}
        tags={[]}
        onRemoveTag={vi.fn()}
        addTagLabel="Añadir"
        placeholder="placeholder"
        emptyText="Sin etiquetas"
      />,
    );

    expect(screen.getByText("Sin etiquetas")).toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: "Nueva" }), "tag");
    await user.keyboard("{Enter}");
    await user.click(screen.getByRole("button", { name: "Añadir" }));

    expect(onNewTagChange).toHaveBeenCalled();
    expect(onAddTag).toHaveBeenCalledTimes(2);
  });

  it("renders existing tags and removes one when its delete action is clicked", async () => {
    const user = userEvent.setup();
    const onRemoveTag = vi.fn();

    render(
      <QuestionTagsEditor
        label="Etiquetas"
        newTagLabel="Nueva"
        newTagValue=""
        onNewTagChange={vi.fn()}
        onAddTag={vi.fn()}
        tags={["integrales"]}
        onRemoveTag={onRemoveTag}
        addTagLabel="Añadir"
        placeholder="placeholder"
        emptyText="Sin etiquetas"
      />,
    );

    expect(screen.getByText("integrales")).toBeInTheDocument();
    const chip = screen.getByRole("button", { name: "integrales" });
    chip.focus();
    await user.keyboard("{Backspace}");
    expect(onRemoveTag).toHaveBeenCalledWith("integrales");
  });
});
