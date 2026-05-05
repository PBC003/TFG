import { describe, expect, it } from "vitest";
import {
  ROUTES,
  getQuizAccessRoute,
  getQuizSimulationRoute,
} from "../../../src/constants/routes";

describe("routes constants", () => {
  it("exposes the expected static routes", () => {
    expect(ROUTES.home).toBe("/");
    expect(ROUTES.login).toBe("/login");
    expect(ROUTES.questions).toBe("/questions");
    expect(ROUTES.groups).toBe("/groups");
    expect(ROUTES.quizzes).toBe("/quizzes");
    expect(ROUTES.quizAccess).toBe("/quiz-access");
  });

  it("builds the quiz access route with and without quiz id", () => {
    expect(getQuizAccessRoute()).toBe("/quiz-access");
    expect(getQuizAccessRoute("quiz-1")).toBe("/quiz-access/quiz-1");
  });

  it("builds the quiz simulation route", () => {
    expect(getQuizSimulationRoute("quiz-1")).toBe("/quizzes/quiz-1/simulate");
  });
});
