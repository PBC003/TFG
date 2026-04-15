import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuestionEditorDialogActions } from "../../../../../src/components/questions/editor/QuestionEditorDialogActions";
import { createT } from "../../../../utils/i18n";

describe("QuestionEditorDialogActions", () => {
  it("calls close and submit in create mode", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSubmit = vi.fn(async () => undefined);

    render(
      <QuestionEditorDialogActions
        questionId={null}
        form={{ type: "true_false" } as never}
        submitting={false}
        t={createT()}
        onClose={onClose}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "common.cancel" }));
    await user.click(screen.getByRole("button", { name: "common.create" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("keeps parametric submit enabled and still disables all actions while submitting", () => {
    const { rerender } = render(
      <QuestionEditorDialogActions
        questionId="q-1"
        form={{ type: "parametric" } as never}
        submitting={false}
        t={createT()}
        onClose={vi.fn()}
        onSubmit={vi.fn(async () => undefined)}
      />,
    );

    expect(screen.getByRole("button", { name: "common.save" })).toBeEnabled();

    rerender(
      <QuestionEditorDialogActions
        questionId="q-1"
        form={{ type: "true_false" } as never}
        submitting={true}
        t={createT()}
        onClose={vi.fn()}
        onSubmit={vi.fn(async () => undefined)}
      />,
    );

    expect(
      screen.getByRole("button", { name: "common.cancel" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "common.save" })).toBeDisabled();
  });
});
