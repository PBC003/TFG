import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PublicQuizCatalogItem } from "../../../../../src/types/quiz";
import { useQuizAccessCatalog } from "../../../../../src/pages/quiz-access/hooks/useQuizAccessCatalog";
import { quizAccessApi } from "../../../../../src/services/quizzes/quiz-access-api";
import { createT } from "../../../../utils/i18n";

vi.mock("../../../../../src/services/quizzes/quiz-access-api", () => ({
  quizAccessApi: {
    listPublishedQuizzes: vi.fn(),
  },
}));

describe("useQuizAccessCatalog", () => {
  const quizzes: PublicQuizCatalogItem[] = [
    {
      quizId: "quiz-1",
      title: "Quiz 1",
      description: "Desc",
      teacherName: "Ada",
      requiresAccessCode: true,
      attemptsAllowed: 2,
      attemptsRemaining: 1,
      totalQuestions: 1,
      totalPoints: 2,
      startAt: null,
      endAt: null,
      timeLimitMinutes: 10,
      publishedAt: "2026-04-12T10:00:00.000Z",
      audienceScope: "all",
      isAvailableNow: true,
      canStart: true,
    },
  ];

  const executeWithSession = async <T,>(
    operation: (token: string) => Promise<T>,
  ) => operation("token-1");

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(quizAccessApi.listPublishedQuizzes).mockResolvedValue({
      quizzes,
    });
  });

  it("loads catalog data, selects by route and paginates", async () => {
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useQuizAccessCatalog({
        routeQuizId: "quiz-1",
        isAuthenticated: true,
        executeWithSession,
        t: createT(),
        onError,
      }),
    );

    await waitFor(() => expect(result.current.catalogLoading).toBe(false));

    expect(result.current.selectedQuiz?.quizId).toBe("quiz-1");
    expect(result.current.paginatedCatalog).toHaveLength(1);

    act(() => {
      result.current.setCatalogSearch("quiz");
      result.current.setCatalogRowsPerPage(10);
    });

    expect(result.current.filteredCatalog).toHaveLength(1);
    expect(result.current.catalogPage).toBe(0);
    expect(onError).not.toHaveBeenCalled();
  });
});
