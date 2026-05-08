import { fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { QuizAttemptQuestionCard } from "../../../../../src/pages/quiz-access/components/QuizAttemptQuestionCard";
import type { PublicAttemptQuestion } from "../../../../../src/types/quiz";
import { renderWithProviders } from "../../../../utils/render";

vi.mock(
  "../../../../../src/pages/quiz-access/components/QuizQuestionInput",
  () => ({
    QuizQuestionInput: (props: {
      onChange: (value: unknown) => void;
      disabled: boolean;
    }) => (
      <div data-testid="question-input">
        <div>{String(props.disabled)}</div>
        <button onClick={() => props.onChange("value")}>change</button>
      </div>
    ),
  }),
);

vi.mock("../../../../../src/components/math/MathText", () => ({
  MathText: ({ value }: { value: string | null }) => <span>{value}</span>,
}));

const question: PublicAttemptQuestion = {
  questionId: "q-1",
  title: "Pregunta 1",
  type: "single_choice",
  statement: "Enunciado",
  explanation: null,
  tags: [],
  points: 3,
  order: 1,
  questionConfig: {
    options: [
      { key: "a", text: "Uno" },
      { key: "b", text: "Dos" },
    ],
  },
};

describe("QuizAttemptQuestionCard", () => {
  it("renders statement and delegates answer changes", () => {
    const onChange = vi.fn();

    renderWithProviders(
      <QuizAttemptQuestionCard
        question={question}
        index={1}
        value={null}
        disabled={false}
        language="es"
        onChange={onChange}
      />,
    );

    expect(screen.getByText("quizAccess.questionTitle")).toBeInTheDocument();
    expect(screen.getByText("quizAccess.pointsLabel")).toBeInTheDocument();
    expect(screen.getByText("Enunciado")).toBeInTheDocument();

    fireEvent.click(screen.getByText("change"));

    expect(onChange).toHaveBeenCalledWith("value");
  });
});
