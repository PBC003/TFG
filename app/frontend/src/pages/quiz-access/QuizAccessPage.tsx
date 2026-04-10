import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { QuizActiveAttemptHeaderCard } from "./components/QuizActiveAttemptHeaderCard";
import { QuizAttemptSection } from "./components/QuizAttemptSection";
import { QuizCatalogSection } from "./components/QuizCatalogSection";
import { QuizResultSection } from "./components/QuizResultSection";
import { SelectedQuizCard } from "./components/SelectedQuizCard";
import { useQuizAccessPage } from "./hooks/useQuizAccessPage";

export default function QuizAccessPage() {
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const navigate = useNavigate();
  const { quizId: routeQuizId } = useParams();
  const participantIdentity = auth.user ? `user:${auth.user.id}` : "";
  const {
    accessCode,
    catalogSearch,
    starting,
    submitting,
    reviewLoading,
    catalogLoading,
    feedback,
    activeAttempt,
    answers,
    result,
    catalogPage,
    catalogRowsPerPage,
    nowMs,
    selectedQuiz,
    filteredCatalog,
    paginatedCatalog,
    selectedQuizStartDisabled,
    canRequestBestResult,
    setAccessCode,
    setCatalogSearch,
    setCatalogPage,
    setCatalogRowsPerPage,
    setFeedback,
    updateAnswer,
    handleStartAttempt,
    handleSubmitAttempt,
    handleLoadBestResult,
    resetLookup,
  } = useQuizAccessPage({
    routeQuizId,
    participantIdentity,
    t,
  });

  const navigateToLookup = () => {
    resetLookup();
    navigate("/quiz-access");
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1080, mx: "auto" }}>
      <Stack spacing={3}>
        {!activeAttempt && !routeQuizId ? (
          <Paper
            variant="outlined"
            sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}
          >
            <Stack spacing={1.25}>
              <Typography variant="h4" fontWeight={800}>
                {t("quizAccess.title")}
              </Typography>
              <Typography color="text.secondary">
                {t("quizAccess.subtitle")}
              </Typography>
            </Stack>
          </Paper>
        ) : null}

        {feedback ? (
          <Alert severity={feedback.severity} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        ) : null}

        {!activeAttempt && !result && routeQuizId ? (
          <Paper
            variant="outlined"
            sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}
          >
            {catalogLoading && !selectedQuiz ? (
              <Typography color="text.secondary">
                {t("common.loading")}
              </Typography>
            ) : !selectedQuiz ? (
              <Stack spacing={1.5}>
                <Typography variant="h5" fontWeight={800}>
                  {t("errors.codes.quiz.not_found")}
                </Typography>
                <Button variant="outlined" onClick={navigateToLookup}>
                  {t("quizAccess.actions.newLookup")}
                </Button>
              </Stack>
            ) : (
              <SelectedQuizCard
                quiz={selectedQuiz}
                accessCode={accessCode}
                startDisabled={selectedQuizStartDisabled}
                loading={starting}
                reviewLoading={reviewLoading}
                canRequestBestResult={canRequestBestResult}
                language={i18n.language}
                onAccessCodeChange={setAccessCode}
                onStart={() =>
                  void handleStartAttempt({
                    quizId: selectedQuiz.quizId,
                    accessCode: selectedQuiz.requiresAccessCode
                      ? accessCode
                      : null,
                  })
                }
                onLoadBestResult={() =>
                  void handleLoadBestResult(selectedQuiz.quizId)
                }
                onResetLookup={navigateToLookup}
              />
            )}
          </Paper>
        ) : null}

        {!activeAttempt && !result && !routeQuizId ? (
          <QuizCatalogSection
            loading={catalogLoading}
            search={catalogSearch}
            filteredCatalog={filteredCatalog}
            paginatedCatalog={paginatedCatalog}
            page={catalogPage}
            rowsPerPage={catalogRowsPerPage}
            selectedQuizId={routeQuizId}
            language={i18n.language}
            onSearchChange={setCatalogSearch}
            onPageChange={setCatalogPage}
            onRowsPerPageChange={(rowsPerPage) => {
              setCatalogRowsPerPage(rowsPerPage);
              setCatalogPage(0);
            }}
            onOpenQuiz={(quizId) => navigate(`/quiz-access/${quizId}`)}
          />
        ) : null}

        {activeAttempt ? (
          <QuizActiveAttemptHeaderCard attempt={activeAttempt} nowMs={nowMs} />
        ) : null}

        {activeAttempt ? (
          <QuizAttemptSection
            attempt={activeAttempt}
            answers={answers}
            submitting={submitting}
            onAnswerChange={updateAnswer}
            onSubmit={() => void handleSubmitAttempt()}
          />
        ) : null}

        {result ? (
          <QuizResultSection
            result={result}
            language={i18n.language}
            starting={starting}
            onNewLookup={navigateToLookup}
            onStartAnotherAttempt={() => void handleStartAttempt()}
          />
        ) : null}
      </Stack>
    </Box>
  );
}
