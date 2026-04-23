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

const parametricQuestion: PublicAttemptQuestion = {
  questionId: "q-param",
  title: "Param",
  type: "parametric",
  statement: "Param statement",
  explanation: null,
  tags: [],
  points: 1,
  order: 1,
  questionConfig: {
    inputPlaceholder: "Ej.: 1/2",
    tolerance: 0.25,
  },
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
        parametricValidationMessage={null}
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
        parametricValidationMessage={null}
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
        parametricValidationMessage={null}
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
        parametricValidationMessage={null}
      />,
    );

    fireEvent.click(screen.getByLabelText("A"));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("handles parametric answers and renders helper data", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <QuizQuestionInput
        question={parametricQuestion}
        value={"2"}
        onChange={onChange}
        disabled={false}
        parametricValidationMessage={null}
      />,
    );

    expect(screen.getByPlaceholderText("Ej.: 1/2")).toHaveValue("2");
    expect(
      screen.getByText("quizAccess.parametricAnswerHelper"),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("quizAccess.parametricAnswerLabel"),
      {
        target: { value: "3/2" },
      },
    );
    expect(onChange).toHaveBeenCalledWith("3/2");
  });

  it("renders validation helper for invalid parametric input", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <QuizQuestionInput
        question={parametricQuestion}
        value={"sin(2)"}
        onChange={onChange}
        disabled={false}
        parametricValidationMessage="unsupported_identifier"
      />,
    );

    expect(
      screen.getByText(
        "quizAccess.parametricAnswerValidation.unsupported_identifier",
      ),
    ).toBeInTheDocument();
  });

  it("handles false answers and ignores non-string entries in multiple choice arrays", () => {
    const onChange = vi.fn();
    renderWithProviders(
      <>
        <QuizQuestionInput
          question={trueFalseQuestion}
          value={true}
          onChange={onChange}
          disabled={false}
          parametricValidationMessage={null}
        />
        <QuizQuestionInput
          question={multipleChoiceQuestion}
          value={["a", 123 as never]}
          onChange={onChange}
          disabled={false}
          parametricValidationMessage={null}
        />
      </>,
    );

    fireEvent.click(screen.getByLabelText("questions.answers.false"));
    expect(onChange).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getAllByLabelText("B")[0]!);
    expect(onChange).toHaveBeenLastCalledWith(["a", "b"]);
  });

  it("uses empty fallbacks for single choice and parametric values that are not strings", () => {
    const onChange = vi.fn();

    renderWithProviders(
      <>
        <QuizQuestionInput
          question={singleChoiceQuestion}
          value={true}
          onChange={onChange}
          disabled={false}
          parametricValidationMessage={null}
        />
        <QuizQuestionInput
          question={{
            ...parametricQuestion,
            questionConfig: {},
          }}
          value={false}
          onChange={onChange}
          disabled
          parametricValidationMessage={null}
        />
      </>,
    );

    expect(screen.getByLabelText("A")).not.toBeChecked();
    expect(
      screen.getByLabelText("quizAccess.parametricAnswerLabel"),
    ).toHaveValue("");
    expect(
      screen.getByLabelText("quizAccess.parametricAnswerLabel"),
    ).toHaveAttribute("placeholder", "");
    expect(
      screen.getByLabelText("quizAccess.parametricAnswerLabel"),
    ).toBeDisabled();
    expect(
      screen.getByText("quizAccess.parametricAnswerHelper"),
    ).toBeInTheDocument();
  });
});
