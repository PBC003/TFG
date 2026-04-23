import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UserConfirmDialog } from "../../../../../../src/pages/admin/components/dialogs/UserConfirmDialog";
import { renderWithProviders } from "../../../../../utils/render";

describe("UserConfirmDialog", () => {
  it("calls close and confirm handlers when enabled", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn(async () => undefined);

    renderWithProviders(
      <UserConfirmDialog
        open
        title="Confirmar"
        description="Descripción"
        confirmLabel="Eliminar"
        submitting={false}
        onClose={onClose}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "common.cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("disables actions while submitting", () => {
    renderWithProviders(
      <UserConfirmDialog
        open
        title="Confirmar"
        description="Descripción"
        confirmLabel="Eliminar"
        submitting
        onClose={vi.fn()}
        onConfirm={vi.fn(async () => undefined)}
      />,
    );

    expect(
      screen.getByRole("button", { name: "common.cancel" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Eliminar" })).toBeDisabled();
  });
});
