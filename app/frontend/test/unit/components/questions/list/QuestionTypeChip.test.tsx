import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuestionTypeChip } from "../../../../../src/components/questions/list/QuestionTypeChip";

describe("QuestionTypeChip", () => {
  it("renders the translated question type label", () => {
    render(<QuestionTypeChip type="single_choice" />);
    expect(
      screen.getByText("questions.types.single_choice"),
    ).toBeInTheDocument();
  });
});
