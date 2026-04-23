import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { GroupItem } from "../../../../../../src/types/group";
import { QuizEditorBasicSettingsSection } from "../../../../../../src/pages/quizzes/components/quiz-editor/QuizEditorBasicSettingsSection";

const fields = {
  title: "title",
  description: "description",
  accessCode: "accessCode",
  accessCodeHelp: "help",
  accessCodePlaceholder: "placeholder",
  accessCodeOptional: "optional",
  attemptsAllowed: "attempts",
  startAt: "startAt",
  startAtHelper: "startHelper",
  endAt: "endAt",
  endAtHelper: "endHelper",
  timeLimitMinutes: "timeLimit",
  shuffleQuestions: "shuffle",
  revealAnswersAfterClose: "reveal",
  assignedGroups: "groups",
  assignedGroupsHelper: "groups helper",
  selectedQuestionsCount: "count {{count}}",
  selectedQuestionsFirst: "selected first",
  questionPaginationLabel: "pagination",
  invalidDateRange: "invalid range",
  invalidEndDateInPast: "past",
};

const groupOptions: GroupItem[] = [
  {
    groupId: "g-1",
    name: "Group A",
    description: null,
    memberUserIds: [1],
    members: [],
    memberCount: 10,
    createdByUserId: 1,
    updatedByUserId: 1,
    version: 1,
    createdAt: "2026-04-12T10:00:00.000Z",
    updatedAt: "2026-04-12T10:00:00.000Z",
  },
  {
    groupId: "g-2",
    name: "Group B",
    description: null,
    memberUserIds: [2],
    members: [],
    memberCount: 8,
    createdByUserId: 1,
    updatedByUserId: 1,
    version: 1,
    createdAt: "2026-04-12T10:00:00.000Z",
    updatedAt: "2026-04-12T10:00:00.000Z",
  },
];

describe("QuizEditorBasicSettingsSection", () => {
  it("updates all editable fields, switches and group selection", () => {
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
      onSelectedGroupsChange: vi.fn(),
    };

    render(
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
        groupOptions={groupOptions}
        selectedGroups={[groupOptions[0]]}
        {...callbacks}
      />,
    );

    expect(screen.getByText("Group A")).toBeInTheDocument();
    expect(screen.getByText("groups helper")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: /title/i }), {
      target: { value: "Nuevo" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /description/i }), {
      target: { value: "Texto" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /accesscode/i }), {
      target: { value: "cd" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: /attempts/i }), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText(/startat/i), {
      target: { value: "2026-05-01T10:00" },
    });
    fireEvent.change(screen.getByLabelText(/endat/i), {
      target: { value: "2026-05-01T12:00" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: /timelimit/i }), {
      target: { value: "45" },
    });
    fireEvent.click(screen.getByRole("switch", { name: /shuffle/i }));
    fireEvent.click(screen.getByRole("switch", { name: /reveal/i }));

    const groupsCombobox = screen.getByRole("combobox", { name: /groups/i });
    fireEvent.mouseDown(groupsCombobox);
    const listbox = screen.getByRole("listbox");
    fireEvent.click(within(listbox).getByText("Group B"));

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
    expect(callbacks.onSelectedGroupsChange).toHaveBeenCalledWith([
      groupOptions[0],
      groupOptions[1],
    ]);
  }, 10000);

  it("disables all editable controls while submitting", () => {
    render(
      <QuizEditorBasicSettingsSection
        fields={fields}
        submitting
        quizTitle="Quiz"
        quizDescription="Desc"
        accessCode="AB"
        attemptsAllowed="2"
        startAt="2026-04-12T10:00"
        endAt="2026-04-12T12:00"
        timeLimitMinutes="30"
        shuffleQuestions
        revealAnswersAfterClose
        groupOptions={groupOptions}
        selectedGroups={[]}
        onQuizTitleChange={vi.fn()}
        onQuizDescriptionChange={vi.fn()}
        onAccessCodeChange={vi.fn()}
        onAttemptsAllowedChange={vi.fn()}
        onStartAtChange={vi.fn()}
        onEndAtChange={vi.fn()}
        onTimeLimitMinutesChange={vi.fn()}
        onShuffleQuestionsChange={vi.fn()}
        onRevealAnswersAfterCloseChange={vi.fn()}
        onSelectedGroupsChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("textbox", { name: /title/i })).toBeDisabled();
    expect(
      screen.getByRole("textbox", { name: /description/i }),
    ).toBeDisabled();
    expect(screen.getByRole("textbox", { name: /accesscode/i })).toBeDisabled();
    expect(
      screen.getByRole("spinbutton", { name: /attempts/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("spinbutton", { name: /timelimit/i }),
    ).toBeDisabled();
    expect(screen.getByLabelText(/groups/i)).toBeDisabled();
    expect(screen.getByRole("switch", { name: /shuffle/i })).toBeDisabled();
    expect(screen.getByRole("switch", { name: /reveal/i })).toBeDisabled();
  });

  it("falls back to optional access-code placeholder and empty groups label", () => {
    render(
      <QuizEditorBasicSettingsSection
        fields={{
          ...fields,
          accessCodePlaceholder: undefined,
          assignedGroups: undefined,
        }}
        submitting={false}
        quizTitle="Quiz"
        quizDescription="Desc"
        accessCode=""
        attemptsAllowed="2"
        startAt=""
        endAt=""
        timeLimitMinutes=""
        shuffleQuestions={false}
        revealAnswersAfterClose={false}
        groupOptions={groupOptions}
        selectedGroups={[]}
        onQuizTitleChange={vi.fn()}
        onQuizDescriptionChange={vi.fn()}
        onAccessCodeChange={vi.fn()}
        onAttemptsAllowedChange={vi.fn()}
        onStartAtChange={vi.fn()}
        onEndAtChange={vi.fn()}
        onTimeLimitMinutesChange={vi.fn()}
        onShuffleQuestionsChange={vi.fn()}
        onRevealAnswersAfterCloseChange={vi.fn()}
        onSelectedGroupsChange={vi.fn()}
      />,
    );

    expect(screen.getByPlaceholderText("optional")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
