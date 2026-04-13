import { describe, expect, it } from "vitest";
import { ROUTES, getQuizAccessRoute } from "../../../src/constants/routes";

describe("routes constants", () => {
  it("exposes the expected static routes", () => {
    expect(ROUTES.home).toBe("/");
    expect(ROUTES.login).toBe("/login");
    expect(ROUTES.questions).toBe("/questions");
    expect(ROUTES.quizzes).toBe("/quizzes");
    expect(ROUTES.quizAccess).toBe("/quiz-access");
  });

  it("builds the quiz access route with and without quiz id", () => {
    expect(getQuizAccessRoute()).toBe("/quiz-access");
    expect(getQuizAccessRoute("quiz-1")).toBe("/quiz-access/quiz-1");
  });
});
