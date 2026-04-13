import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuizEditorBasicSettingsSection } from "../../../../../../src/pages/quizzes/components/quiz-editor/QuizEditorBasicSettingsSection";
import { renderWithProviders } from "../../../../../utils/render";

const fields = {
  title: "title",
  description: "description",
  accessCode: "accessCode",
  accessCodeHelp: "help",
  accessCodePlaceholder: "placeholder",
  attemptsAllowed: "attempts",
  startAt: "startAt",
  startAtHelper: "startHelper",
  endAt: "endAt",
  endAtHelper: "endHelper",
  timeLimitMinutes: "timeLimit",
  shuffleQuestions: "shuffle",
  revealAnswersAfterClose: "reveal",
  selectedQuestionsCount: "count {{count}}",
  selectedQuestionsFirst: "selected first",
  questionPaginationLabel: "pagination",
  invalidDateRange: "invalid range",
  invalidEndDateInPast: "past",
};

describe("QuizEditorBasicSettingsSection", () => {
  it("updates all editable fields and switches", () => {
    const callbacks = {
      onQuizTitleChange: vi.fn(),
      onQuizDescriptionChange: vi.fn(),
      onAccessCodeChange: vi.fn(),
      onAttemptsAllowedChange: vi.fn(),
      onStartAtChange: vi.fn(),
      onEndAtChange: vi.fn(),
      onTimeLimitMinutesChange: vi.fn(),
      onShuffleQuestionsChange: vi.fn(),
      onRevealAnswersAfterCloseChange: vi.fn(),
    };

    renderWithProviders(
      <QuizEditorBasicSettingsSection
        fields={fields}
        submitting={false}
        quizTitle="Quiz"
        quizDescription="Desc"
        accessCode="AB"
        attemptsAllowed="2"
        startAt="2026-04-12T10:00"
        endAt="2026-04-12T12:00"
        timeLimitMinutes="30"
        shuffleQuestions={false}
        revealAnswersAfterClose={false}
        {...callbacks}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: /title/i }), {
      target: { value: "Nuevo" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /description/i }), {
      target: { value: "Texto" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /accessCode/i }), {
      target: { value: "cd" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: /attempts/i }), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText(/startAt/i), {
      target: { value: "2026-05-01T10:00" },
    });
    fireEvent.change(screen.getByLabelText(/endAt/i), {
      target: { value: "2026-05-01T12:00" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: /timeLimit/i }), {
      target: { value: "45" },
    });
    fireEvent.click(screen.getByRole("switch", { name: /shuffle/i }));
    fireEvent.click(screen.getByRole("switch", { name: /reveal/i }));

    expect(callbacks.onQuizTitleChange).toHaveBeenCalledWith("Nuevo");
    expect(callbacks.onQuizDescriptionChange).toHaveBeenCalledWith("Texto");
    expect(callbacks.onAccessCodeChange).toHaveBeenCalledWith("CD");
    expect(callbacks.onAttemptsAllowedChange).toHaveBeenCalledWith("3");
    expect(callbacks.onStartAtChange).toHaveBeenCalledWith("2026-05-01T10:00");
    expect(callbacks.onEndAtChange).toHaveBeenCalledWith("2026-05-01T12:00");
    expect(callbacks.onTimeLimitMinutesChange).toHaveBeenCalledWith("45");
    expect(callbacks.onShuffleQuestionsChange).toHaveBeenCalledWith(true);
    expect(callbacks.onRevealAnswersAfterCloseChange).toHaveBeenCalledWith(
      true,
    );
  });
});
