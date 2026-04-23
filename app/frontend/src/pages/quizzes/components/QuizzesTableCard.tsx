import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { QuizItem } from "../../../types/quiz";
import { formatDateTime } from "../../../utils/date";

type QuizzesTableCardProps = {
  loading: boolean;
  submitting: boolean;
  quizzes: QuizItem[];
  totalQuizzes: number;
  page: number;
  rowsPerPage: number;
  language: string;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onEdit: (quiz: QuizItem) => void;
  onCopyLink: (quiz: QuizItem) => Promise<void>;
  onTogglePublishStatus: (quiz: QuizItem) => Promise<void>;
  onDelete: (quiz: QuizItem) => Promise<void>;
  onOpenAnalytics: (quiz: QuizItem) => void;
  onStartSimulation: (quiz: QuizItem) => void;
};

export function QuizzesTableCard({
  loading,
  submitting,
  quizzes,
  totalQuizzes,
  page,
  rowsPerPage,
  language,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onCopyLink,
  onTogglePublishStatus,
  onDelete,
  onOpenAnalytics,
  onStartSimulation,
}: QuizzesTableCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      {loading ? (
        <CardContent sx={{ p: 3 }}>
          <Typography color="text.secondary">{t("common.loading")}</Typography>
        </CardContent>
      ) : totalQuizzes === 0 ? (
        <CardContent sx={{ p: 3 }}>
          <Typography color="text.secondary">{t("quizzes.empty")}</Typography>
        </CardContent>
      ) : (
        <>
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
                {quizzes.map((quiz) => {
                  const assignedGroups = quiz.assignedGroups ?? [];

                  return (
                    <TableRow key={quiz.quizId} hover>
                      <TableCell>
                        <Stack spacing={0.75}>
                          <Typography fontWeight={700}>{quiz.title}</Typography>
                          {quiz.description ? (
                            <Typography variant="body2" color="text.secondary">
                              {quiz.description}
                            </Typography>
                          ) : null}
                          <Stack
                            direction="row"
                            spacing={0.75}
                            flexWrap="wrap"
                            useFlexGap
                          >
                            <Chip
                              size="small"
                              variant="outlined"
                              label={
                                assignedGroups.length > 0
                                  ? t("quizzes.audience.groups", {
                                      count: assignedGroups.length,
                                    })
                                  : t("quizzes.audience.all")
                              }
                            />
                            {assignedGroups.slice(0, 2).map((group) => (
                              <Chip
                                key={group.groupId}
                                size="small"
                                label={group.name}
                              />
                            ))}
                          </Stack>
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
                        {formatDateTime(quiz.updatedAt, language)}
                      </TableCell>
                      <TableCell align="right" sx={{ minWidth: 420 }}>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: {
                              xs: "repeat(2, minmax(0, 1fr))",
                            },
                            gap: 1,
                            width: "100%",
                            maxWidth: 360,
                            ml: "auto",
                          }}
                        >
                          <Button
                            size="small"
                            fullWidth
                            startIcon={<EditRoundedIcon />}
                            onClick={() => onEdit(quiz)}
                            disabled={!quiz.canEdit || submitting}
                          >
                            {t("common.edit")}
                          </Button>
                          <Button
                            size="small"
                            fullWidth
                            startIcon={<PreviewRoundedIcon />}
                            onClick={() => onStartSimulation(quiz)}
                          >
                            {t("quizzes.actions.simulate")}
                          </Button>
                          <Button
                            size="small"
                            fullWidth
                            startIcon={<ContentCopyRoundedIcon />}
                            onClick={() => void onCopyLink(quiz)}
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
                            onClick={() => void onTogglePublishStatus(quiz)}
                            disabled={submitting}
                          >
                            {quiz.status === "published"
                              ? t("quizzes.actions.unpublish")
                              : t("quizzes.actions.publish")}
                          </Button>
                          <Button
                            size="small"
                            fullWidth
                            startIcon={<InsightsRoundedIcon />}
                            onClick={() => onOpenAnalytics(quiz)}
                            disabled={!quiz.hasAttempts}
                          >
                            {t("quizzes.actions.analytics")}
                          </Button>
                          <Button
                            size="small"
                            fullWidth
                            color="error"
                            startIcon={<DeleteOutlineRoundedIcon />}
                            onClick={() => void onDelete(quiz)}
                            disabled={!quiz.canDelete || submitting}
                          >
                            {t("common.delete")}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalQuizzes}
            page={page}
            onPageChange={(_, nextPage) => onPageChange(nextPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) =>
              onRowsPerPageChange(Number.parseInt(event.target.value, 10))
            }
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage={t("quizzes.pagination.rowsPerPage")}
            sx={{
              borderTop: 1,
              borderColor: "divider",
              "& .MuiTablePagination-toolbar": {
                flexWrap: "wrap",
                rowGap: 1,
                px: { xs: 1.5, sm: 2 },
              },
            }}
          />
        </>
      )}
    </Card>
  );
}
