import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { quizHistoryApi } from "../../services/quizzes/quiz-history-api";
import type { QuizHistoryItem } from "../../types/quiz";
import { formatDateTime } from "../../utils/date";
import { getErrorMessage } from "../../utils/error-code";

export default function QuizHistoryPage() {
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setFeedback(null);

    try {
      const response = await auth.executeWithSession((token) =>
        quizHistoryApi.listMyHistory(token),
      );
      setHistory(response.history);
    } catch (error) {
      setFeedback(getErrorMessage(t, error));
    } finally {
      setLoading(false);
    }
  }, [auth, t]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  return (
    <Box sx={{ width: "100%", maxWidth: 1180, mx: "auto" }}>
      <Stack spacing={3}>
        <Card>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={1}>
              <Typography variant="h4" fontWeight={800}>
                {t("quizHistory.title")}
              </Typography>
              <Typography color="text.secondary">
                {t("quizHistory.subtitle")}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {feedback ? <Alert severity="error">{feedback}</Alert> : null}

        <Card>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ p: 3 }}>
                <Typography color="text.secondary">
                  {t("common.loading")}
                </Typography>
              </Box>
            ) : history.length === 0 ? (
              <Box sx={{ p: 3 }}>
                <Typography color="text.secondary">
                  {t("quizHistory.empty")}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("quizHistory.table.quiz")}</TableCell>
                      <TableCell>{t("quizHistory.table.status")}</TableCell>
                      <TableCell>{t("quizHistory.table.attempt")}</TableCell>
                      <TableCell>{t("quizHistory.table.startedAt")}</TableCell>
                      <TableCell>
                        {t("quizHistory.table.submittedAt")}
                      </TableCell>
                      <TableCell>{t("quizHistory.table.score")}</TableCell>
                      <TableCell align="right">{t("common.actions")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map((attempt) => (
                      <TableRow key={attempt.attemptId} hover>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography fontWeight={700}>
                              {attempt.quizTitle}
                            </Typography>
                            {attempt.quizDescription ? (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {attempt.quizDescription}
                              </Typography>
                            ) : null}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {t(`quizAnalytics.status.${attempt.status}`)}
                        </TableCell>
                        <TableCell>{attempt.attemptNumber}</TableCell>
                        <TableCell>
                          {formatDateTime(attempt.startedAt, i18n.language)}
                        </TableCell>
                        <TableCell>
                          {formatDateTime(attempt.submittedAt, i18n.language)}
                        </TableCell>
                        <TableCell>
                          {t("quizHistory.rawScoreValue", {
                            earned: attempt.earnedPoints,
                            max: attempt.maxPoints,
                          })}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            startIcon={<LaunchRoundedIcon />}
                            onClick={() =>
                              navigate(`/quiz-access/${attempt.quizId}`)
                            }
                          >
                            {t("quizHistory.openQuiz")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
