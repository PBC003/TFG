import {
  Alert,
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { QuizAttemptDetailDialog } from "./components/QuizAttemptDetailDialog";
import { QuizAnalyticsAttemptsCard } from "./analytics/components/QuizAnalyticsAttemptsCard";
import { QuizAnalyticsDistributionCard } from "./analytics/components/QuizAnalyticsDistributionCard";
import { QuizAnalyticsHeaderCard } from "./analytics/components/QuizAnalyticsHeaderCard";
import { QuizAnalyticsQuestionStatsCard } from "./analytics/components/QuizAnalyticsQuestionStatsCard";
import { QuizAnalyticsSummaryGrid } from "./analytics/components/QuizAnalyticsSummaryGrid";
import { useQuizAnalyticsPage } from "./analytics/hooks/useQuizAnalyticsPage";

export default function QuizAnalyticsPage() {
  const { t, i18n } = useTranslation();
  const { quizId = "" } = useParams();
  const navigate = useNavigate();
  const {
    analytics,
    detail,
    loading,
    exporting,
    detailLoading,
    attemptSearch,
    attemptsPage,
    attemptsRowsPerPage,
    feedback,
    filteredAttempts,
    paginatedAttempts,
    distributionLabels,
    setAttemptSearch,
    setAttemptsPage,
    setAttemptsRowsPerPage,
    setDetail,
    setFeedback,
    handleOpenDetail,
    handleExport,
  } = useQuizAnalyticsPage({ quizId, t });

  const summaryItems = useMemo(
    () =>
      analytics
        ? [
            {
              label: t("quizAnalytics.summary.totalAttempts"),
              value: analytics.summary.totalAttempts,
            },
            {
              label: t("quizAnalytics.summary.uniqueParticipants"),
              value: analytics.summary.uniqueParticipants,
            },
            {
              label: t("quizAnalytics.summary.averageScore"),
              value: analytics.summary.averageScoreOverTen,
            },
            {
              label: t("quizAnalytics.summary.bestScore"),
              value: analytics.summary.bestScoreOverTen,
            },
            {
              label: t("quizAnalytics.summary.averageCompletionMinutes"),
              value: analytics.summary.averageCompletionMinutes,
            },
            {
              label: t("quizAnalytics.summary.submittedAttempts"),
              value: analytics.summary.submittedAttempts,
            },
          ]
        : [],
    [analytics, t],
  );

  return (
    <Box sx={{ width: "100%", maxWidth: 1240, mx: "auto" }}>
      <Stack spacing={3}>
        <QuizAnalyticsHeaderCard
          title={analytics?.title ?? t("quizAnalytics.title")}
          description={analytics?.description ?? t("quizAnalytics.subtitle")}
          onBack={() => navigate("/quizzes")}
          onExportStats={() => window.print()}
          backLabel={t("quizAnalytics.backToQuizzes")}
          exportStatsLabel={t("quizAnalytics.exportStats")}
        />

        {feedback ? (
          <Alert severity={feedback.severity} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        ) : null}

        {loading ? (
          <Card>
            <CardContent>
              <Typography color="text.secondary">
                {t("common.loading")}
              </Typography>
            </CardContent>
          </Card>
        ) : null}

        {!loading && analytics ? (
          <>
            <QuizAnalyticsSummaryGrid
              items={summaryItems}
              language={i18n.language}
            />

            <QuizAnalyticsDistributionCard
              title={t("quizAnalytics.distributionTitle")}
              labels={distributionLabels}
              outcomeLabels={{
                passed: t("quizAnalytics.distributionOutcomes.passed"),
                failed: t("quizAnalytics.distributionOutcomes.failed"),
                completed: t("quizAnalytics.distributionOutcomes.completed"),
              }}
              analytics={analytics}
              language={i18n.language}
            />

            <Box className="analytics-print-hidden">
              <QuizAnalyticsAttemptsCard
                loading={loading}
                detailLoading={detailLoading}
                allAttemptsCount={analytics.attempts.length}
                filteredAttemptsCount={filteredAttempts.length}
                attempts={paginatedAttempts}
                attemptSearch={attemptSearch}
                attemptsPage={attemptsPage}
                attemptsRowsPerPage={attemptsRowsPerPage}
                language={i18n.language}
                exportDisabled={!analytics || exporting}
                labels={{
                  title: t("quizAnalytics.attemptsTitle"),
                  subtitle: t("quizAnalytics.attemptsSubtitle"),
                  exportCsv: t("quizAnalytics.exportCsv"),
                  searchPlaceholder: t("quizAnalytics.searchPlaceholder"),
                  empty: t("quizAnalytics.empty"),
                  searchEmpty: t("quizAnalytics.searchEmpty"),
                  participant: t("quizAnalytics.table.participant"),
                  attempt: t("quizAnalytics.table.attempt"),
                  status: t("quizAnalytics.table.status"),
                  startedAt: t("quizAnalytics.table.startedAt"),
                  submittedAt: t("quizAnalytics.table.submittedAt"),
                  score: t("quizAnalytics.table.score"),
                  viewDetail: t("quizAnalytics.viewDetail"),
                  rowsPerPage: t("quizAnalytics.pagination.rowsPerPage"),
                  actions: t("common.actions"),
                }}
                onSearchChange={setAttemptSearch}
                onPageChange={setAttemptsPage}
                onRowsPerPageChange={(value) => {
                  setAttemptsRowsPerPage(value);
                  setAttemptsPage(0);
                }}
                onOpenDetail={(attemptId) => void handleOpenDetail(attemptId)}
                onExport={() => void handleExport()}
                getStatusLabel={(status) =>
                  t(`quizAnalytics.status.${status}`)
                }
              />
            </Box>

            <QuizAnalyticsQuestionStatsCard
              title={t("quizAnalytics.questionStatsTitle")}
              stats={analytics.questionStats}
              language={i18n.language}
              labels={{
                question: t("quizAnalytics.questionStats.question"),
                attempts: t("quizAnalytics.questionStats.attempts"),
                correct: t("quizAnalytics.questionStats.correct"),
                incorrect: t("quizAnalytics.questionStats.incorrect"),
                unanswered: t("quizAnalytics.questionStats.unanswered"),
                correctRate: t("quizAnalytics.questionStats.correctRate"),
                averagePoints: t("quizAnalytics.questionStats.averagePoints"),
                answerDistribution: t(
                  "quizAnalytics.questionStats.answerDistribution",
                ),
                responses: t("quizAnalytics.questionStats.responses"),
                otherAnswers: t("quizAnalytics.questionStats.otherAnswers"),
                getTypeLabel: (type) => t(`questions.types.${type}`),
                getAnswerLabel: (answer) =>
                  answer.key === "__unanswered__"
                    ? t("quizAnalytics.questionStats.unanswered")
                    : answer.key === "__other__"
                      ? t("quizAnalytics.questionStats.otherAnswers")
                    : answer.key === "true" || answer.key === "false"
                      ? t(`quizAnalytics.questionStats.boolean.${answer.key}`)
                      : answer.label,
              }}
            />
          </>
        ) : null}
      </Stack>

      <QuizAttemptDetailDialog
        detail={detail}
        language={i18n.language}
        onClose={() => setDetail(null)}
      />
    </Box>
  );
}
