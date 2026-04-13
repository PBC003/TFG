import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizzesPageHeaderCard } from "../../../../../src/pages/quizzes/components/QuizzesPageHeaderCard";
import { renderWithProviders } from "../../../../utils/render";

describe("QuizzesPageHeaderCard", () => {
  it("renders actions and delegates refresh/create callbacks", () => {
    const onRefresh = vi.fn(async () => undefined);
    const onCreate = vi.fn();

    renderWithProviders(
      <QuizzesPageHeaderCard
        loading={false}
        submitting={false}
        onRefresh={onRefresh}
        onCreate={onCreate}
      />,
    );

    expect(screen.getByText("quizzes.title")).toBeInTheDocument();
    expect(screen.getByText("quizzes.subtitle")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "common.refresh" }));
    fireEvent.click(
      screen.getByRole("button", { name: "quizzes.createAction" }),
    );

    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it("disables actions while submitting/loading", () => {
    renderWithProviders(
      <QuizzesPageHeaderCard
        loading
        submitting
        onRefresh={vi.fn(async () => undefined)}
        onCreate={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "common.refresh" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "quizzes.createAction" }),
    ).toBeDisabled();
  });
});
