export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  profile: "/profile",
  admin: "/admin",
  questions: "/questions",
  quizzes: "/quizzes",
  groups: "/groups",
  quizAccess: "/quiz-access",
  quizHistory: "/quiz-history",
  about: "/about",
  unauthorized: "/unauthorized",
} as const;

export function getQuizSimulationRoute(quizId: string): string {
  return `${ROUTES.quizzes}/${quizId}/simulate`;
}

export function getQuizAccessRoute(quizId?: string): string {
  return quizId ? `${ROUTES.quizAccess}/${quizId}` : ROUTES.quizAccess;
}
