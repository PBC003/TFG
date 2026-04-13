import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizQuestionInput } from "../../../../../src/pages/quiz-access/components/QuizQuestionInput";
import type { PublicAttemptQuestion } from "../../../../../src/types/quiz";
import { renderWithProviders } from "../../../../utils/render";

vi.mock("../../../../../src/components/math/MathText", () => ({
  MathText: ({ value }: { value: string | null }) => <span>{value}</span>,
}));

const trueFalseQuestion: PublicAttemptQuestion = {
  questionId: "q-tf",
  title: "TF",
  type: "true_false",
  statement: "TF statement",
  explanation: null,
  tags: [],
  points: 1,
  order: 1,
  questionConfig: {},
};

const singleChoiceQuestion: PublicAttemptQuestion = {
  questionId: "q-sc",
  title: "SC",
  type: "single_choice",
  statement: "SC statement",
  explanation: null,
  tags: [],
  points: 1,
  order: 1,
  questionConfig: {
    options: [
      { key: "a", text: "A" },
      { key: "b", text: "B" },
    ],
  },
};

const multipleChoiceQuestion: PublicAttemptQuestion = {
  ...singleChoiceQuestion,
  questionId: "q-mc",
  type: "multiple_choice",
};

describe("QuizQuestionInput", () => {
  it("handles true/false answers", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <QuizQuestionInput
        question={trueFalseQuestion}
        value={null}
        onChange={onChange}
        disabled={false}
      />,
    );

    fireEvent.click(screen.getByLabelText("questions.answers.true"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("handles single-choice answers", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <QuizQuestionInput
        question={singleChoiceQuestion}
        value={null}
        onChange={onChange}
        disabled={false}
      />,
    );

    fireEvent.click(screen.getByLabelText("A"));
    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("handles multiple-choice answers", () => {
    const onChange = vi.fn();
    const { rerender } = renderWithProviders(
      <QuizQuestionInput
        question={multipleChoiceQuestion}
        value={[]}
        onChange={onChange}
        disabled={false}
      />,
    );

    fireEvent.click(screen.getByLabelText("A"));
    expect(onChange).toHaveBeenCalledWith(["a"]);

    rerender(
      <QuizQuestionInput
        question={multipleChoiceQuestion}
        value={["a"]}
        onChange={onChange}
        disabled={false}
      />,
    );

    fireEvent.click(screen.getByLabelText("A"));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});
