import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useQuestionsPage } from "../../../../src/pages/questions/hooks/useQuestionsPage";
import type { QuestionItem } from "../../../../src/types/question";
import { questionsApi } from "../../../../src/services/questions/questions-api";
import { useAuth } from "../../../../src/hooks/useAuth";
import { getErrorMessage } from "../../../../src/utils/error-code";
import { createAuthValue } from "../../../utils/auth";
import { createT } from "../../../utils/i18n";

vi.mock("../../../../src/hooks/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("../../../../src/services/questions/questions-api", () => ({
  questionsApi: {
    listQuestions: vi.fn(),
    createQuestion: vi.fn(),
    updateQuestion: vi.fn(),
    deleteQuestion: vi.fn(),
  },
}));
vi.mock("../../../../src/utils/error-code", () => ({
  getErrorMessage: vi.fn(() => "translated-error"),
}));

const questionA: QuestionItem = {
  questionId: "q-a",
  title: "Integral",
  type: "true_false",
  statement: "\\int x dx",
  explanation: null,
  tags: ["integrales"],
  createdByUserId: 1,
  updatedByUserId: 1,
  version: 1,
  questionConfig: { correctAnswer: true },
  createdAt: "2026-03-30T10:00:00.000Z",
  updatedAt: "2026-03-30T10:00:00.000Z",
};
const questionB: QuestionItem = {
  ...questionA,
  questionId: "q-b",
  title: "Derivada",
  type: "single_choice",
  statement: "d/dx x^2",
  tags: ["derivadas", "reglas"],
  questionConfig: {
    options: [
      { key: "a", text: "2x" },
      { key: "b", text: "x" },
    ],
    correctOptionKey: "a",
  },
};

describe("useQuestionsPage", () => {
  const executeWithSession = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue(
      createAuthValue({ executeWithSession }) as ReturnType<typeof useAuth>,
    );
    executeWithSession.mockImplementation(async (callback) =>
      callback("token"),
    );
    vi.mocked(questionsApi.listQuestions).mockResolvedValue({
      questions: [questionA, questionB],
    });
    vi.mocked(questionsApi.createQuestion).mockResolvedValue({
      question: { ...questionA, questionId: "q-new", title: "Nueva" },
    });
    vi.mocked(questionsApi.updateQuestion).mockResolvedValue({
      question: { ...questionA, title: "Integral editada" },
    });
    vi.mocked(questionsApi.deleteQuestion).mockResolvedValue(undefined);
  });

  it("loads questions, filters them, paginates and manages editor/delete state", async () => {
    const t = createT();
    const { result } = renderHook(() => useQuestionsPage({ t }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.visibleQuestions.map((q) => q.questionId)).toEqual([
      "q-a",
      "q-b",
    ]);
    expect(result.current.paginatedQuestions.map((q) => q.questionId)).toEqual([
      "q-a",
      "q-b",
    ]);
    expect(result.current.page).toBe(0);
    expect(result.current.rowsPerPage).toBe(5);

    act(() => {
      result.current.setRowsPerPage(1);
    });
    expect(result.current.paginatedQuestions.map((q) => q.questionId)).toEqual([
      "q-a",
    ]);

    act(() => {
      result.current.setPage(1);
    });
    expect(result.current.paginatedQuestions.map((q) => q.questionId)).toEqual([
      "q-b",
    ]);

    act(() => {
      result.current.setSearch("deri");
    });
    expect(result.current.page).toBe(0);
    expect(result.current.visibleQuestions.map((q) => q.questionId)).toEqual([
      "q-b",
    ]);

    act(() => {
      result.current.setTypeFilter("single_choice");
    });
    expect(result.current.typeFilter).toBe("single_choice");
    expect(result.current.visibleQuestions.map((q) => q.questionId)).toEqual([
      "q-b",
    ]);
    act(() => {
      result.current.openCreateDialog();
    });
    expect(result.current.editorOpen).toBe(true);
    expect(result.current.editingQuestion).toBeNull();
    act(() => {
      result.current.openEditDialog(questionA);
    });
    expect(result.current.editingQuestion?.questionId).toBe("q-a");
    act(() => {
      result.current.closeEditor();
    });
    expect(result.current.editorOpen).toBe(false);
    expect(result.current.editingQuestion).toBeNull();
    act(() => {
      result.current.openDeleteDialog(questionB);
    });
    expect(result.current.deletingQuestion?.questionId).toBe("q-b");
    act(() => {
      result.current.closeDeleteDialog();
    });
    expect(result.current.deletingQuestion).toBeNull();
  });

  it("submits create, update and delete flows and clears feedback", async () => {
    const t = createT();
    const { result } = renderHook(() => useQuestionsPage({ t }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.submitEditor({
        title: "Nueva",
        type: "true_false",
        statement: "stmt",
        questionConfig: { correctAnswer: true },
      });
    });
    expect(result.current.questions[0]?.questionId).toBe("q-new");
    expect(result.current.feedback).toEqual({
      severity: "success",
      message: "questions.createSuccess",
    });
    act(() => {
      result.current.openEditDialog(questionA);
    });
    await act(async () => {
      await result.current.submitEditor({ title: "Integral editada" });
    });
    expect(
      result.current.questions.find((q) => q.questionId === "q-a")?.title,
    ).toBe("Integral editada");
    act(() => {
      result.current.openDeleteDialog(questionB);
    });
    await act(async () => {
      await result.current.confirmDelete();
    });
    expect(result.current.questions.map((q) => q.questionId)).not.toContain(
      "q-b",
    );
    act(() => {
      result.current.clearFeedback();
    });
    expect(result.current.feedback).toBeNull();
  });

  it("reports translated errors and keeps dialogs open while submitting", async () => {
    vi.mocked(questionsApi.listQuestions).mockRejectedValue(new Error("boom"));
    const never = new Promise<never>(() => undefined);
    vi.mocked(questionsApi.createQuestion).mockReturnValueOnce(never);
    const t = createT();
    const { result } = renderHook(() => useQuestionsPage({ t }));
    await waitFor(() =>
      expect(result.current.feedback).toEqual({
        severity: "error",
        message: "translated-error",
      }),
    );
    act(() => {
      result.current.openCreateDialog();
      void result.current.submitEditor({
        title: "Nueva",
        type: "true_false",
        statement: "stmt",
        questionConfig: { correctAnswer: true },
      });
    });
    await waitFor(() => expect(result.current.submitting).toBe(true));
    act(() => {
      result.current.closeEditor();
    });
    expect(result.current.editorOpen).toBe(true);
    act(() => {
      result.current.openDeleteDialog(questionA);
      result.current.closeDeleteDialog();
    });
    expect(result.current.deletingQuestion?.questionId).toBe("q-a");
    expect(getErrorMessage).toHaveBeenCalled();
  });
});
