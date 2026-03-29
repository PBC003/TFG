import AddRoundedIcon from "@mui/icons-material/AddRounded";
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { QuestionEditorDialog } from "../../components/questions/QuestionEditorDialog";
import { useAuth } from "../../hooks/useAuth";
import { questionsApi } from "../../services/questions/questions-api";
import type {
  CreateQuestionInput,
  QuestionItem,
  QuestionType,
  UpdateQuestionInput,
} from "../../types/question";
import { formatDateTime } from "../../utils/date";
import { getErrorMessage } from "../../utils/error-code";

type FeedbackState = {
  severity: "success" | "error";
  message: string;
} | null;

const TYPE_FILTERS: Array<QuestionType | "all"> = [
  "all",
  "true_false",
  "single_choice",
  "multiple_choice",
  "parametric",
];

export default function QuestionsPage() {
  const { t, i18n } = useTranslation();
  const auth = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<QuestionType | "all">("all");
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(
    null,
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState<QuestionItem | null>(
    null,
  );

  const loadQuestions = useCallback(
    async (successMessage?: string) => {
      setLoading(true);

      try {
        const response = await auth.executeWithSession((token) =>
          questionsApi.listQuestions(token),
        );
        setQuestions(response.questions);
        if (successMessage) {
          setFeedback({ severity: "success", message: successMessage });
        }
      } catch (error) {
        setFeedback({ severity: "error", message: getErrorMessage(t, error) });
      } finally {
        setLoading(false);
      }
    },
    [auth, t],
  );

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  const visibleQuestions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return questions.filter((question) => {
      const matchesSearch =
        !normalizedSearch ||
        question.title.toLowerCase().includes(normalizedSearch) ||
        question.statement.toLowerCase().includes(normalizedSearch) ||
        question.tags.some((tag) =>
          tag.toLowerCase().includes(normalizedSearch),
        ) ||
        question.questionId.toLowerCase().includes(normalizedSearch);

      const matchesType = typeFilter === "all" || question.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [questions, search, typeFilter]);

  const openCreateDialog = () => {
    setEditingQuestion(null);
    setEditorOpen(true);
  };

  const handleEditorClose = () => {
    if (submitting) {
      return;
    }

    setEditorOpen(false);
    setEditingQuestion(null);
  };

  const handleEditorSubmit = async (
    payload: CreateQuestionInput | UpdateQuestionInput,
  ) => {
    setSubmitting(true);

    try {
      if (editingQuestion) {
        const response = await auth.executeWithSession((token) =>
          questionsApi.updateQuestion(
            token,
            editingQuestion.questionId,
            payload,
          ),
        );
        setQuestions((current) =>
          current.map((question) =>
            question.questionId === response.question.questionId
              ? response.question
              : question,
          ),
        );
        setFeedback({
          severity: "success",
          message: t("questions.updateSuccess"),
        });
      } else {
        const response = await auth.executeWithSession((token) =>
          questionsApi.createQuestion(token, payload as CreateQuestionInput),
        );
        setQuestions((current) => [response.question, ...current]);
        setFeedback({
          severity: "success",
          message: t("questions.createSuccess"),
        });
      }

      setEditorOpen(false);
      setEditingQuestion(null);
    } catch (error) {
      setFeedback({ severity: "error", message: getErrorMessage(t, error) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingQuestion) {
      return;
    }

    setSubmitting(true);

    try {
      await auth.executeWithSession((token) =>
        questionsApi.deleteQuestion(token, deletingQuestion.questionId),
      );
      setQuestions((current) =>
        current.filter(
          (question) => question.questionId !== deletingQuestion.questionId,
        ),
      );
      setFeedback({
        severity: "success",
        message: t("questions.deleteSuccess"),
      });
      setDeletingQuestion(null);
    } catch (error) {
      setFeedback({ severity: "error", message: getErrorMessage(t, error) });
    } finally {
      setSubmitting(false);
    }
  };

  const renderTypeChip = (type: QuestionType) => (
    <Chip size="small" label={t(`questions.types.${type}`)} />
  );

  return (
    <Box sx={{ width: "100%", maxWidth: 1180, mx: "auto" }}>
      <Stack spacing={3}>
        <Card>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack
              spacing={2}
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <Stack spacing={1.25}>
                <Typography variant="h4" fontWeight={700}>
                  {t("questions.title")}
                </Typography>
                <Typography color="text.secondary">
                  {t("questions.subtitle")}
                </Typography>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshRoundedIcon />}
                  onClick={() =>
                    void loadQuestions(t("questions.refreshSuccess"))
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
                  {t("questions.createAction")}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {feedback ? (
          <Alert severity={feedback.severity} onClose={() => setFeedback(null)}>
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
                  label={t("questions.searchPlaceholder")}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  fullWidth
                />

                <TextField
                  select
                  label={t("questions.typeFilter")}
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(event.target.value as QuestionType | "all")
                  }
                  sx={{ minWidth: { xs: "100%", md: 240 } }}
                >
                  {TYPE_FILTERS.map((value) => (
                    <MenuItem key={value} value={value}>
                      {value === "all"
                        ? t("common.all")
                        : t(`questions.types.${value}`)}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Typography color="text.secondary">
                {t("questions.totalVisible", {
                  count: visibleQuestions.length,
                })}
              </Typography>

              {loading ? (
                <Typography color="text.secondary">
                  {t("common.loading")}
                </Typography>
              ) : visibleQuestions.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Typography color="text.secondary">
                    {t("questions.empty")}
                  </Typography>
                </Paper>
              ) : isMobile ? (
                <Stack spacing={1.5}>
                  {visibleQuestions.map((question) => (
                    <Paper
                      key={question.questionId}
                      variant="outlined"
                      sx={{ p: 2.25 }}
                    >
                      <Stack spacing={1.5}>
                        <Stack spacing={0.75}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            gap={1}
                          >
                            <Typography fontWeight={700}>
                              {question.title}
                            </Typography>
                            {renderTypeChip(question.type)}
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            {question.questionId}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {question.statement}
                          </Typography>
                        </Stack>

                        <Stack direction="row" flexWrap="wrap" gap={0.75}>
                          {question.tags.length > 0 ? (
                            question.tags.map((tag) => (
                              <Chip
                                key={`${question.questionId}-${tag}`}
                                label={tag}
                                size="small"
                                variant="outlined"
                              />
                            ))
                          ) : (
                            <Chip
                              label={t("common.none")}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Stack>

                        <Typography variant="body2" color="text.secondary">
                          {t("questions.lastUpdated", {
                            value: formatDateTime(
                              question.updatedAt,
                              i18n.language,
                            ),
                          })}
                        </Typography>

                        <Stack
                          direction="row"
                          justifyContent="flex-end"
                          spacing={1}
                        >
                          <Button
                            size="small"
                            startIcon={<EditRoundedIcon />}
                            onClick={() => {
                              setEditingQuestion(question);
                              setEditorOpen(true);
                            }}
                          >
                            {t("common.edit")}
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteOutlineRoundedIcon />}
                            onClick={() => setDeletingQuestion(question)}
                          >
                            {t("common.delete")}
                          </Button>
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Paper variant="outlined" sx={{ overflowX: "auto" }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("questions.table.title")}</TableCell>
                        <TableCell>{t("questions.table.type")}</TableCell>
                        <TableCell>{t("questions.table.tags")}</TableCell>
                        <TableCell>{t("questions.table.version")}</TableCell>
                        <TableCell>{t("questions.table.updatedAt")}</TableCell>
                        <TableCell align="right">
                          {t("common.actions")}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visibleQuestions.map((question) => (
                        <TableRow key={question.questionId} hover>
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography fontWeight={700}>
                                {question.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {question.questionId}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {question.statement}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{renderTypeChip(question.type)}</TableCell>
                          <TableCell>
                            <Stack direction="row" flexWrap="wrap" gap={0.75}>
                              {question.tags.length > 0 ? (
                                question.tags.map((tag) => (
                                  <Chip
                                    key={`${question.questionId}-${tag}`}
                                    label={tag}
                                    size="small"
                                    variant="outlined"
                                  />
                                ))
                              ) : (
                                <Chip
                                  label={t("common.none")}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>{question.version}</TableCell>
                          <TableCell>
                            {formatDateTime(question.updatedAt, i18n.language)}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: "inline-flex", gap: 0.5 }}>
                              <IconButton
                                aria-label={t("common.edit")}
                                onClick={() => {
                                  setEditingQuestion(question);
                                  setEditorOpen(true);
                                }}
                              >
                                <EditRoundedIcon />
                              </IconButton>
                              <IconButton
                                aria-label={t("common.delete")}
                                color="error"
                                onClick={() => setDeletingQuestion(question)}
                              >
                                <DeleteOutlineRoundedIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              )}
            </Stack>
          </CardContent>
        </Card>

        {editorOpen ? (
          <QuestionEditorDialog
            key={editingQuestion?.questionId ?? "new"}
            open={editorOpen}
            question={editingQuestion}
            submitting={submitting}
            onClose={handleEditorClose}
            onSubmit={handleEditorSubmit}
          />
        ) : null}

        <Dialog
          open={Boolean(deletingQuestion)}
          onClose={submitting ? undefined : () => setDeletingQuestion(null)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>{t("questions.dialogs.deleteTitle")}</DialogTitle>
          <DialogContent>
            <Typography color="text.secondary">
              {t("questions.dialogs.deleteDescription")}
            </Typography>
            {deletingQuestion ? (
              <Typography sx={{ mt: 2, fontWeight: 700 }}>
                {deletingQuestion.title}
              </Typography>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeletingQuestion(null)}
              disabled={submitting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => void handleDelete()}
              color="error"
              variant="contained"
              disabled={submitting}
            >
              {t("common.delete")}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  );
}
