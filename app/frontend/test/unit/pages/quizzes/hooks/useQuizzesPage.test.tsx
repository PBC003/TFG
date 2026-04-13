import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../../../../../src/hooks/useAuth";
import { useQuizzesPage } from "../../../../../src/pages/quizzes/hooks/useQuizzesPage";
import { questionsApi } from "../../../../../src/services/questions/questions-api";
import { quizzesApi } from "../../../../../src/services/quizzes/quizzes-api";
import type { QuestionItem } from "../../../../../src/types/question";
import type { QuizItem, QuizQuestionItem } from "../../../../../src/types/quiz";
import { getErrorMessage } from "../../../../../src/utils/error-code";
import { createAuthValue } from "../../../../utils/auth";
import { createT } from "../../../../utils/i18n";

vi.mock("../../../../../src/hooks/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("../../../../../src/services/questions/questions-api", () => ({
  questionsApi: { listQuestions: vi.fn() },
}));
vi.mock("../../../../../src/services/quizzes/quizzes-api", () => ({
  quizzesApi: {
    listQuizzes: vi.fn(),
    createQuiz: vi.fn(),
    updateQuiz: vi.fn(),
    publishQuiz: vi.fn(),
    unpublishQuiz: vi.fn(),
    deleteQuiz: vi.fn(),
  },
}));
vi.mock("../../../../../src/utils/error-code", () => ({
  getErrorMessage: vi.fn(() => "translated-error"),
}));

describe("useQuizzesPage", () => {
  const executeWithSession = vi.fn();

  const quizQuestion: QuizQuestionItem = {
    questionId: "q-1",
    title: "Question 1",
    type: "true_false",
    statement: "Statement",
    tags: [],
    points: 2,
    order: 0,
  };

  const quiz: QuizItem = {
    quizId: "quiz-1",
    title: "Quiz 1",
    description: "Desc",
    accessCode: "ABCD",
    requiresAccessCode: true,
    status: "draft",
    hasAttempts: false,
    canEdit: true,
    canDelete: true,
    attemptsAllowed: 2,
    startAt: null,
    endAt: null,
    timeLimitMinutes: null,
    shuffleQuestions: false,
    revealAnswersAfterClose: false,
    publishedAt: null,
    totalQuestions: 1,
    totalPoints: 2,
    questions: [quizQuestion],
    createdByUserId: 1,
    updatedByUserId: 1,
    version: 1,
    createdAt: "2026-04-12T10:00:00.000Z",
    updatedAt: "2026-04-12T10:00:00.000Z",
  };

  const question: QuestionItem = {
    questionId: "q-1",
    title: "Question 1",
    type: "true_false",
    statement: "Statement",
    explanation: null,
    tags: [],
    createdByUserId: 1,
    updatedByUserId: 1,
    version: 1,
    questionConfig: { correctAnswer: true },
    createdAt: "2026-04-12T10:00:00.000Z",
    updatedAt: "2026-04-12T10:00:00.000Z",
  };

  const buildQuiz = (overrides: Partial<QuizItem> = {}): QuizItem => ({
    ...quiz,
    ...overrides,
    questions: overrides.questions ?? quiz.questions,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, origin: "http://localhost:5173" },
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn(async () => undefined) },
    });
    vi.mocked(useAuth).mockReturnValue(
      createAuthValue({ executeWithSession }) as never,
    );
    executeWithSession.mockImplementation(
      async (operation: (token: string) => Promise<unknown>) =>
        operation("token"),
    );
    vi.mocked(quizzesApi.listQuizzes).mockResolvedValue({ quizzes: [quiz] });
    vi.mocked(questionsApi.listQuestions).mockResolvedValue({
      questions: [question],
    });
    vi.mocked(quizzesApi.createQuiz).mockResolvedValue({
      quiz: buildQuiz({ quizId: "quiz-2", title: "Quiz 2" }),
    });
    vi.mocked(quizzesApi.updateQuiz).mockResolvedValue({
      quiz: buildQuiz({ title: "Updated" }),
    });
    vi.mocked(quizzesApi.publishQuiz).mockResolvedValue({
      quiz: buildQuiz({ status: "published", canEdit: false }),
    });
    vi.mocked(quizzesApi.unpublishQuiz).mockResolvedValue({
      quiz: buildQuiz({ status: "draft", canEdit: true }),
    });
    vi.mocked(quizzesApi.deleteQuiz).mockResolvedValue({ success: true });
  });

  it("loads quizzes, filters, manages dialogs and executes CRUD/publish flows", async () => {
    const t = createT();
    const { result } = renderHook(() => useQuizzesPage({ t }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.paginatedQuizzes).toHaveLength(1);

    act(() => {
      result.current.setSearch("quiz");
      result.current.setStatusFilter("draft");
      result.current.setRowsPerPage(1);
      result.current.setPage(0);
      result.current.openCreateDialog();
    });
    expect(result.current.editorOpen).toBe(true);
    await waitFor(() => expect(result.current.questionBank).toHaveLength(1));

    await act(async () => {
      await result.current.submitEditor({
        title: "Quiz 2",
        description: null,
        accessCode: null,
        requiresAccessCode: false,
        attemptsAllowed: 1,
        startAt: null,
        endAt: null,
        timeLimitMinutes: null,
        shuffleQuestions: false,
        revealAnswersAfterClose: false,
        questions: [{ questionId: "q-1", points: 2 }],
      });
    });
    expect(result.current.quizzes[0]?.quizId).toBe("quiz-2");

    act(() => {
      result.current.openEditDialog(quiz);
    });
    await act(async () => {
      await result.current.submitEditor({ title: "Updated" });
    });
    expect(
      result.current.quizzes.find((item) => item.quizId === "quiz-1")?.title,
    ).toBe("Updated");

    await act(async () => {
      await result.current.togglePublishStatus(quiz);
    });
    expect(
      result.current.quizzes.find((item) => item.quizId === "quiz-1")?.status,
    ).toBe("published");

    await act(async () => {
      await result.current.copyAccessLink(quiz);
    });
    expect(window.navigator.clipboard.writeText).toHaveBeenCalledWith(
      "http://localhost:5173/quiz-access/quiz-1",
    );

    await act(async () => {
      await result.current.deleteQuiz(quiz);
    });
    expect(quizzesApi.deleteQuiz).toHaveBeenCalledWith("token", "quiz-1");
    expect(
      result.current.quizzes.find((item) => item.quizId === "quiz-1"),
    ).toBeUndefined();
  });

  it("shows info locks and translated errors for failing operations", async () => {
    const t = createT();
    const { result } = renderHook(() => useQuizzesPage({ t }));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.openEditDialog(buildQuiz({ canEdit: false }));
    });
    expect(result.current.feedback).toEqual({
      severity: "info",
      message: "quizzes.editLocked",
    });

    act(() => {
      void result.current.deleteQuiz(buildQuiz({ canDelete: false }));
    });
    expect(result.current.feedback).toEqual({
      severity: "info",
      message: "quizzes.deleteLocked",
    });

    vi.mocked(quizzesApi.listQuizzes).mockRejectedValueOnce(new Error("boom"));
    await act(async () => {
      await result.current.refreshQuizzes();
    });
    expect(result.current.feedback).toEqual({
      severity: "error",
      message: "translated-error",
    });
    expect(getErrorMessage).toHaveBeenCalled();
  });
});
