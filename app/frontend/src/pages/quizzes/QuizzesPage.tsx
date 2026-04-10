import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { formatDateTime } from "../../utils/date";
import { QuizEditorDialog } from "./components/QuizEditorDialog";
import { useQuizzesPage } from "./hooks/useQuizzesPage";

export default function QuizzesPage() {
  const { t, i18n } = useTranslation();
  const {
    visibleQuizzes,
    questionBank,
    loading,
    submitting,
    feedback,
    search,
    statusFilter,
    editorOpen,
    editingQuiz,
    setSearch,
    setStatusFilter,
    clearFeedback,
    openCreateDialog,
    openEditDialog,
    closeEditor,
    submitEditor,
    togglePublishStatus,
    copyAccessLink,
    deleteQuiz,
    refreshQuizzes,
  } = useQuizzesPage({ t });

  return (
    <Box sx={{ width: "100%", maxWidth: 1240, mx: "auto" }}>
      <Stack spacing={3}>
        <Card>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", md: "center" }}
              spacing={2}
            >
              <Stack spacing={1.25}>
                <Typography variant="h4" fontWeight={700}>
                  {t("quizzes.title")}
                </Typography>
                <Typography color="text.secondary">
                  {t("quizzes.subtitle")}
                </Typography>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshRoundedIcon />}
                  onClick={() =>
                    void refreshQuizzes(t("quizzes.refreshSuccess"))
                  }
                  disabled={loading || submitting}
                >
                  {t("common.refresh")}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  onClick={openCreateDialog}
                  disabled={submitting}
                >
                  {t("quizzes.createAction")}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {feedback ? (
          <Alert severity={feedback.severity} onClose={clearFeedback}>
            {feedback.message}
          </Alert>
        ) : null}

        <Card>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2.5}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                alignItems={{ xs: "stretch", md: "center" }}
              >
                <TextField
                  label={t("quizzes.searchPlaceholder")}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  fullWidth
                />

                <TextField
                  select
                  label={t("quizzes.statusFilter")}
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as "all" | "draft" | "published",
                    )
                  }
                  sx={{ minWidth: { xs: "100%", md: 220 } }}
                >
                  <MenuItem value="all">{t("common.all")}</MenuItem>
                  <MenuItem value="draft">{t("quizzes.status.draft")}</MenuItem>
                  <MenuItem value="published">
                    {t("quizzes.status.published")}
                  </MenuItem>
                </TextField>
              </Stack>

              <Typography color="text.secondary">
                {t("quizzes.totalVisible", { count: visibleQuizzes.length })}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          {loading ? (
            <CardContent sx={{ p: 3 }}>
              <Typography color="text.secondary">
                {t("common.loading")}
              </Typography>
            </CardContent>
          ) : visibleQuizzes.length === 0 ? (
            <CardContent sx={{ p: 3 }}>
              <Typography color="text.secondary">
                {t("quizzes.empty")}
              </Typography>
            </CardContent>
          ) : (
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("quizzes.table.title")}</TableCell>
                    <TableCell>{t("quizzes.table.status")}</TableCell>
                    <TableCell>{t("quizzes.table.accessCode")}</TableCell>
                    <TableCell>{t("quizzes.table.questions")}</TableCell>
                    <TableCell>{t("quizzes.table.attempts")}</TableCell>
                    <TableCell>{t("quizzes.table.updatedAt")}</TableCell>
                    <TableCell align="right">{t("common.actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleQuizzes.map((quiz) => (
                    <TableRow key={quiz.quizId} hover>
                      <TableCell>
                        <Stack spacing={0.75}>
                          <Typography fontWeight={700}>{quiz.title}</Typography>
                          {quiz.description ? (
                            <Typography variant="body2" color="text.secondary">
                              {quiz.description}
                            </Typography>
                          ) : null}
                          {!quiz.canEdit ? (
                            <Typography variant="caption" color="warning.main">
                              {quiz.hasAttempts
                                ? t("quizzes.lockedByAttempts")
                                : t("quizzes.lockedWhilePublished")}
                            </Typography>
                          ) : null}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t(`quizzes.status.${quiz.status}`)}
                          color={
                            quiz.status === "published" ? "success" : "default"
                          }
                          variant={
                            quiz.status === "published" ? "filled" : "outlined"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography fontFamily="monospace" fontWeight={700}>
                            {quiz.requiresAccessCode
                              ? quiz.accessCode
                              : t("quizzes.noAccessCode")}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {quiz.requiresAccessCode
                              ? t("quizzes.accessCodeRequired")
                              : t("quizzes.directLinkOnly")}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ minWidth: 160 }}>
                        <Typography variant="body2">
                          {t("quizzes.questionSummary", {
                            count: quiz.totalQuestions,
                            points: quiz.totalPoints,
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="body2">
                            {t("quizzes.attemptSummary", {
                              count: quiz.attemptsAllowed,
                            })}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {quiz.timeLimitMinutes
                              ? t("quizzes.timeLimitSummary", {
                                  value: quiz.timeLimitMinutes,
                                })
                              : t("quizzes.noTimeLimit")}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {formatDateTime(quiz.updatedAt, i18n.language)}
                      </TableCell>
                      <TableCell align="right" sx={{ minWidth: 320 }}>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: {
                              xs: "repeat(2, minmax(0, 1fr))",
                            },
                            gap: 1,
                            width: "100%",
                            maxWidth: 340,
                            ml: "auto",
                          }}
                        >
                          <Button
                            size="small"
                            fullWidth
                            startIcon={<EditRoundedIcon />}
                            onClick={() => openEditDialog(quiz)}
                            disabled={!quiz.canEdit || submitting}
                          >
                            {t("common.edit")}
                          </Button>
                          <Button
                            size="small"
                            fullWidth
                            startIcon={<ContentCopyRoundedIcon />}
                            onClick={() => void copyAccessLink(quiz)}
                          >
                            {t("quizzes.actions.copyLink")}
                          </Button>
                          <Button
                            size="small"
                            fullWidth
                            variant={
                              quiz.status === "published"
                                ? "outlined"
                                : "contained"
                            }
                            color={
                              quiz.status === "published"
                                ? "warning"
                                : "primary"
                            }
                            onClick={() => void togglePublishStatus(quiz)}
                            disabled={submitting}
                          >
                            {quiz.status === "published"
                              ? t("quizzes.actions.unpublish")
                              : t("quizzes.actions.publish")}
                          </Button>
                          <Button
                            size="small"
                            fullWidth
                            color="error"
                            startIcon={<DeleteOutlineRoundedIcon />}
                            onClick={() => void deleteQuiz(quiz)}
                            disabled={!quiz.canDelete || submitting}
                          >
                            {t("common.delete")}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        {editorOpen ? (
          <QuizEditorDialog
            key={editingQuiz?.quizId ?? "new"}
            open={editorOpen}
            quiz={editingQuiz}
            questionBank={questionBank}
            submitting={submitting}
            title={
              editingQuiz
                ? t("quizzes.dialogs.editTitle")
                : t("quizzes.dialogs.createTitle")
            }
            description={t("quizzes.dialogs.description")}
            cancelLabel={t("common.cancel")}
            saveLabel={editingQuiz ? t("common.save") : t("common.create")}
            searchPlaceholder={t("quizzes.dialogs.questionSearchPlaceholder")}
            unsupportedTypeLabel={t("quizzes.dialogs.unsupportedTypeLabel")}
            questionsSectionTitle={t("quizzes.dialogs.questionsSectionTitle")}
            questionPointsLabel={t("quizzes.dialogs.questionPointsLabel")}
            noQuestionsLabel={t("quizzes.dialogs.noQuestionsLabel")}
            validationMessage={t("quizzes.dialogs.validationMessage")}
            fields={{
              title: t("quizzes.fields.title"),
              description: t("quizzes.fields.description"),
              accessCode: t("quizzes.fields.accessCode"),
              attemptsAllowed: t("quizzes.fields.attemptsAllowed"),
              startAt: t("quizzes.fields.startAt"),
              endAt: t("quizzes.fields.endAt"),
              timeLimitMinutes: t("quizzes.fields.timeLimitMinutes"),
              shuffleQuestions: t("quizzes.fields.shuffleQuestions"),
              revealAnswersAfterClose: t(
                "quizzes.fields.revealAnswersAfterClose",
              ),
              accessCodeOptional: t("quizzes.fields.accessCodeOptional"),
              accessCodeHelp: t("quizzes.fields.accessCodeHelp"),
              accessCodeAuto: t("quizzes.fields.accessCodeAuto"),
              selectedQuestionsFirst: t(
                "quizzes.dialogs.selectedQuestionsFirst",
              ),
              selectedQuestionsCount: t(
                "quizzes.dialogs.selectedQuestionsCount",
              ),
              questionPaginationLabel: t(
                "quizzes.dialogs.questionPaginationLabel",
              ),
              startAtHelper: t("quizzes.fields.startAtHelper"),
              endAtHelper: t("quizzes.fields.endAtHelper"),
              invalidDateRange: t("quizzes.fields.invalidDateRange"),
              invalidEndDateInPast: t("quizzes.fields.invalidEndDateInPast"),
            }}
            onClose={closeEditor}
            onSubmit={submitEditor}
          />
        ) : null}
      </Stack>
    </Box>
  );
}
