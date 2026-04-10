export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  profile: "/profile",
  admin: "/admin",
  questions: "/questions",
  quizzes: "/quizzes",
  quizAccess: "/quiz-access",
  about: "/about",
  unauthorized: "/unauthorized",
} as const;

export function getQuizAccessRoute(quizId?: string): string {
  return quizId ? `${ROUTES.quizAccess}/${quizId}` : ROUTES.quizAccess;
}
