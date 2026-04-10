import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import RemoveCircleOutlineRoundedIcon from "@mui/icons-material/RemoveCircleOutlineRounded";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  Paper,
  Stack,
  Switch,
  TablePagination,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { MathText } from "../../../components/math/MathText";
import type { QuestionItem } from "../../../types/question";
import type {
  CreateQuizInput,
  QuizItem,
  UpdateQuizInput,
} from "../../../types/quiz";

interface QuizEditorDialogProps {
  open: boolean;
  quiz: QuizItem | null;
  questionBank: QuestionItem[];
  submitting: boolean;
  title: string;
  description: string;
  cancelLabel: string;
  saveLabel: string;
  searchPlaceholder: string;
  unsupportedTypeLabel: string;
  questionsSectionTitle: string;
  questionPointsLabel: string;
  noQuestionsLabel: string;
  validationMessage: string | null;
  fields: {
    title: string;
    description: string;
    accessCode: string;
    attemptsAllowed: string;
    startAt: string;
    endAt: string;
    timeLimitMinutes: string;
    shuffleQuestions: string;
    revealAnswersAfterClose: string;
    accessCodeOptional: string;
    accessCodeHelp: string;
    accessCodeAuto: string;
    selectedQuestionsFirst: string;
    selectedQuestionsCount: string;
    questionPaginationLabel: string;
    startAtHelper: string;
    endAtHelper: string;
    invalidDateRange: string;
    invalidEndDateInPast: string;
  };
  onClose: () => void;
  onSubmit: (payload: CreateQuizInput | UpdateQuizInput) => Promise<void>;
}

type SelectedQuestionState = {
  questionId: string;
  points: number;
};

// cspell:disable-next-line
const ACCESS_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const QUESTION_ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

function generateAccessCode(length = 6) {
  let result = "";

  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * ACCESS_CODE_ALPHABET.length);
    result += ACCESS_CODE_ALPHABET[randomIndex];
  }

  return result;
}

function toLocalDateTimeValue(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toIsoDateTimeValue(value: string): string | null {
  if (!value.trim()) {
    return null;
  }

  return new Date(value).toISOString();
}

function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\\{}_^$]/g, " ")
    .toLowerCase();
}

type QuizEditorDialogContentProps = Omit<QuizEditorDialogProps, "open">;

type QuizEditorInitialState = {
  quizTitle: string;
  quizDescription: string;
  accessCode: string;
  requiresAccessCode: boolean;
  attemptsAllowed: string;
  startAt: string;
  endAt: string;
  timeLimitMinutes: string;
  shuffleQuestions: boolean;
  revealAnswersAfterClose: boolean;
  selectedQuestions: SelectedQuestionState[];
};

function getInitialState(quiz: QuizItem | null): QuizEditorInitialState {
  return {
    quizTitle: quiz?.title ?? "",
    quizDescription: quiz?.description ?? "",
    accessCode: quiz?.accessCode ?? generateAccessCode(),
    requiresAccessCode: quiz?.requiresAccessCode ?? false,
    attemptsAllowed: String(quiz?.attemptsAllowed ?? 1),
    startAt: toLocalDateTimeValue(quiz?.startAt ?? null),
    endAt: toLocalDateTimeValue(quiz?.endAt ?? null),
    timeLimitMinutes: quiz?.timeLimitMinutes
      ? String(quiz.timeLimitMinutes)
      : "",
    shuffleQuestions: quiz?.shuffleQuestions ?? false,
    revealAnswersAfterClose: quiz?.revealAnswersAfterClose ?? false,
    selectedQuestions: (quiz?.questions ?? []).map((question) => ({
      questionId: question.questionId,
      points: question.points,
    })),
  };
}

function QuizEditorDialogContent({
  quiz,
  questionBank,
  submitting,
  title,
  description,
  cancelLabel,
  saveLabel,
  searchPlaceholder,
  unsupportedTypeLabel,
  questionsSectionTitle,
  questionPointsLabel,
  noQuestionsLabel,
  validationMessage,
  fields,
  onClose,
  onSubmit,
}: QuizEditorDialogContentProps) {
  const initialState = getInitialState(quiz);
  const [quizTitle, setQuizTitle] = useState(initialState.quizTitle);
  const [quizDescription, setQuizDescription] = useState(
    initialState.quizDescription,
  );
  const [accessCode, setAccessCode] = useState(initialState.accessCode);
  const [requiresAccessCode, setRequiresAccessCode] = useState(
    initialState.requiresAccessCode,
  );
  const [attemptsAllowed, setAttemptsAllowed] = useState(
    initialState.attemptsAllowed,
  );
  const [startAt, setStartAt] = useState(initialState.startAt);
  const [endAt, setEndAt] = useState(initialState.endAt);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(
    initialState.timeLimitMinutes,
  );
  const [shuffleQuestions, setShuffleQuestions] = useState(
    initialState.shuffleQuestions,
  );
  const [revealAnswersAfterClose, setRevealAnswersAfterClose] = useState(
    initialState.revealAnswersAfterClose,
  );
  const [search, setSearch] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<
    SelectedQuestionState[]
  >(initialState.selectedQuestions);
  const [localValidationMessage, setLocalValidationMessage] = useState<
    string | null
  >(null);
  const [questionPage, setQuestionPage] = useState(0);
  const [questionRowsPerPage, setQuestionRowsPerPage] = useState(10);

  const selectedQuestionMap = useMemo(
    () =>
      new Map(
        selectedQuestions.map((question) => [question.questionId, question]),
      ),
    [selectedQuestions],
  );

  const orderedQuestions = useMemo(() => {
    const normalizedSearch = normalizeForSearch(search.trim());

    return questionBank
      .filter((question) => {
        if (!normalizedSearch) {
          return true;
        }

        return normalizeForSearch(
          [
            question.title,
            question.statement,
            question.questionId,
            ...question.tags,
          ].join(" "),
        ).includes(normalizedSearch);
      })
      .sort((left, right) => {
        const leftSelected = selectedQuestionMap.has(left.questionId) ? 0 : 1;
        const rightSelected = selectedQuestionMap.has(right.questionId) ? 0 : 1;

        if (leftSelected !== rightSelected) {
          return leftSelected - rightSelected;
        }

        return left.title.localeCompare(right.title, undefined, {
          sensitivity: "base",
        });
      });
  }, [questionBank, search, selectedQuestionMap]);

  const pagedQuestions = useMemo(() => {
    const startIndex = questionPage * questionRowsPerPage;
    return orderedQuestions.slice(startIndex, startIndex + questionRowsPerPage);
  }, [orderedQuestions, questionPage, questionRowsPerPage]);

  const toggleQuestion = (question: QuestionItem) => {
    setQuestionPage(0);
    setSelectedQuestions((current) => {
      const existingQuestion = current.find(
        (candidate) => candidate.questionId === question.questionId,
      );

      if (existingQuestion) {
        return current.filter(
          (candidate) => candidate.questionId !== question.questionId,
        );
      }

      return [...current, { questionId: question.questionId, points: 1 }];
    });
  };

  const updateQuestionPoints = (questionId: string, nextValue: string) => {
    const numericValue = Number.parseInt(nextValue, 10);

    setSelectedQuestions((current) =>
      current.map((question) =>
        question.questionId === questionId
          ? {
              ...question,
              points: Number.isNaN(numericValue)
                ? 0
                : Math.max(0, numericValue),
            }
          : question,
      ),
    );
  };

  const hasUnsupportedSelectedQuestion = selectedQuestions.some(
    (selectedQuestion) => {
      const question = questionBank.find(
        (candidate) => candidate.questionId === selectedQuestion.questionId,
      );

      return question?.type === "parametric";
    },
  );

  const handleSubmit = async () => {
    const normalizedTitle = quizTitle.trim();
    const normalizedDescription = quizDescription.trim() || null;
    const normalizedAccessCode = accessCode.trim().toUpperCase();
    const normalizedAttemptsAllowed = Number.parseInt(attemptsAllowed, 10);
    const normalizedTimeLimit = Number.parseInt(timeLimitMinutes, 10);
    const normalizedStartAt = toIsoDateTimeValue(startAt);
    const normalizedEndAt = toIsoDateTimeValue(endAt);
    const nowMs = Date.now();

    if (normalizedTitle.length < 3) {
      setLocalValidationMessage(validationMessage);
      return;
    }

    if (requiresAccessCode && normalizedAccessCode.length < 4) {
      setLocalValidationMessage(validationMessage);
      return;
    }

    if (
      Number.isNaN(normalizedAttemptsAllowed) ||
      normalizedAttemptsAllowed < 1 ||
      selectedQuestions.length === 0 ||
      hasUnsupportedSelectedQuestion ||
      selectedQuestions.some((question) => question.points <= 0)
    ) {
      setLocalValidationMessage(validationMessage);
      return;
    }

    if (normalizedStartAt && normalizedEndAt) {
      if (
        new Date(normalizedEndAt).getTime() <=
        new Date(normalizedStartAt).getTime()
      ) {
        setLocalValidationMessage(fields.invalidDateRange);
        return;
      }
    }

    if (normalizedEndAt && new Date(normalizedEndAt).getTime() <= nowMs) {
      setLocalValidationMessage(fields.invalidEndDateInPast);
      return;
    }

    const payload: CreateQuizInput = {
      title: normalizedTitle,
      description: normalizedDescription,
      accessCode: requiresAccessCode ? normalizedAccessCode : null,
      requiresAccessCode,
      attemptsAllowed: normalizedAttemptsAllowed,
      startAt: normalizedStartAt,
      endAt: normalizedEndAt,
      timeLimitMinutes:
        timeLimitMinutes.trim() && !Number.isNaN(normalizedTimeLimit)
          ? normalizedTimeLimit
          : null,
      shuffleQuestions,
      revealAnswersAfterClose,
      questions: selectedQuestions.map((question) => ({
        questionId: question.questionId,
        points: question.points,
      })),
    };

    setLocalValidationMessage(null);
    await onSubmit(payload);
  };

  return (
    <>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Typography color="text.secondary">{description}</Typography>

          {localValidationMessage ? (
            <Alert severity="warning">{localValidationMessage}</Alert>
          ) : null}

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
            }}
          >
            <TextField
              label={fields.title}
              value={quizTitle}
              onChange={(event) => setQuizTitle(event.target.value)}
              disabled={submitting}
              required
              fullWidth
            />
            <TextField
              label={fields.attemptsAllowed}
              value={attemptsAllowed}
              onChange={(event) => setAttemptsAllowed(event.target.value)}
              disabled={submitting}
              type="number"
              inputProps={{ min: 1, max: 10 }}
              fullWidth
            />
            <TextField
              label={fields.timeLimitMinutes}
              value={timeLimitMinutes}
              onChange={(event) => setTimeLimitMinutes(event.target.value)}
              disabled={submitting}
              type="number"
              inputProps={{ min: 1, max: 300 }}
              fullWidth
            />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={requiresAccessCode}
                    onChange={(event) =>
                      setRequiresAccessCode(event.target.checked)
                    }
                    disabled={submitting}
                  />
                }
                label={fields.accessCodeOptional}
              />
            </Box>
            <TextField
              label={fields.startAt}
              helperText={fields.startAtHelper}
              value={startAt}
              onChange={(event) => setStartAt(event.target.value)}
              disabled={submitting}
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label={fields.endAt}
              helperText={fields.endAtHelper}
              value={endAt}
              onChange={(event) => setEndAt(event.target.value)}
              disabled={submitting}
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>

          <TextField
            label={fields.description}
            value={quizDescription}
            onChange={(event) => setQuizDescription(event.target.value)}
            disabled={submitting}
            minRows={3}
            multiline
            fullWidth
          />

          {requiresAccessCode ? (
            <TextField
              label={fields.accessCode}
              helperText={fields.accessCodeHelp}
              value={accessCode}
              onChange={(event) =>
                setAccessCode(event.target.value.toUpperCase())
              }
              disabled={submitting}
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setAccessCode(generateAccessCode())}
                      disabled={submitting}
                      aria-label={fields.accessCodeAuto}
                    >
                      <AutoAwesomeRoundedIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          ) : null}

          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            <FormControlLabel
              control={
                <Switch
                  checked={shuffleQuestions}
                  onChange={(event) =>
                    setShuffleQuestions(event.target.checked)
                  }
                  disabled={submitting}
                />
              }
              label={fields.shuffleQuestions}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={revealAnswersAfterClose}
                  onChange={(event) =>
                    setRevealAnswersAfterClose(event.target.checked)
                  }
                  disabled={submitting}
                />
              }
              label={fields.revealAnswersAfterClose}
            />
          </Stack>

          <Divider />

          <Stack spacing={1.5}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              spacing={1.5}
              alignItems={{ md: "center" }}
            >
              <Stack spacing={0.5}>
                <Typography variant="h6">{questionsSectionTitle}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {fields.selectedQuestionsCount.replace(
                    "{{count}}",
                    String(selectedQuestions.length),
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {fields.selectedQuestionsFirst}
                </Typography>
              </Stack>
              <TextField
                label={searchPlaceholder}
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setQuestionPage(0);
                }}
                disabled={submitting}
                fullWidth
                sx={{ maxWidth: { xs: "100%", md: 360 } }}
              />
            </Stack>

            {orderedQuestions.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Typography color="text.secondary">
                  {noQuestionsLabel}
                </Typography>
              </Paper>
            ) : (
              <>
                <List disablePadding sx={{ display: "grid", gap: 1.5 }}>
                  {pagedQuestions.map((question) => {
                    const selectedQuestion = selectedQuestionMap.get(
                      question.questionId,
                    );
                    const isSelected = Boolean(selectedQuestion);
                    const isUnsupported = question.type === "parametric";

                    return (
                      <ListItem
                        key={question.questionId}
                        disableGutters
                        sx={{ display: "block" }}
                      >
                        <Paper
                          variant="outlined"
                          sx={{ p: 2, borderRadius: 2.5 }}
                        >
                          <Stack spacing={1.5}>
                            <Stack
                              direction={{ xs: "column", md: "row" }}
                              justifyContent="space-between"
                              spacing={1.5}
                            >
                              <Stack spacing={0.75}>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    onChange={() => toggleQuestion(question)}
                                    disabled={submitting || isUnsupported}
                                  />
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight={700}
                                  >
                                    {question.title}
                                  </Typography>
                                </Stack>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  flexWrap="wrap"
                                  useFlexGap
                                >
                                  <Chip
                                    size="small"
                                    label={question.type}
                                    color={
                                      isUnsupported ? "warning" : "default"
                                    }
                                  />
                                  {isUnsupported ? (
                                    <Chip
                                      size="small"
                                      label={unsupportedTypeLabel}
                                      color="warning"
                                      variant="outlined"
                                    />
                                  ) : null}
                                  {question.tags.map((tag) => (
                                    <Chip
                                      key={`${question.questionId}-${tag}`}
                                      size="small"
                                      label={tag}
                                    />
                                  ))}
                                </Stack>
                              </Stack>

                              {isSelected ? (
                                <TextField
                                  label={questionPointsLabel}
                                  value={selectedQuestion?.points ?? 1}
                                  onChange={(event) =>
                                    updateQuestionPoints(
                                      question.questionId,
                                      event.target.value,
                                    )
                                  }
                                  disabled={submitting}
                                  type="number"
                                  inputProps={{ min: 1 }}
                                  sx={{ width: { xs: "100%", md: 160 } }}
                                />
                              ) : null}
                            </Stack>

                            <MathText
                              value={question.statement}
                              emptyText="—"
                            />

                            <Stack direction="row" justifyContent="flex-end">
                              <Button
                                size="small"
                                variant={isSelected ? "outlined" : "contained"}
                                onClick={() => toggleQuestion(question)}
                                disabled={submitting || isUnsupported}
                                startIcon={
                                  isSelected ? (
                                    <RemoveCircleOutlineRoundedIcon />
                                  ) : (
                                    <AddCircleOutlineRoundedIcon />
                                  )
                                }
                              >
                                {isSelected ? cancelLabel : saveLabel}
                              </Button>
                            </Stack>
                          </Stack>
                        </Paper>
                      </ListItem>
                    );
                  })}
                </List>

                <TablePagination
                  component="div"
                  count={orderedQuestions.length}
                  page={questionPage}
                  onPageChange={(_, nextPage) => setQuestionPage(nextPage)}
                  rowsPerPage={questionRowsPerPage}
                  onRowsPerPageChange={(event) => {
                    setQuestionRowsPerPage(
                      Number.parseInt(event.target.value, 10),
                    );
                    setQuestionPage(0);
                  }}
                  rowsPerPageOptions={QUESTION_ROWS_PER_PAGE_OPTIONS}
                  labelRowsPerPage={fields.questionPaginationLabel}
                />
              </>
            )}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          {cancelLabel}
        </Button>
        <Button
          onClick={() => void handleSubmit()}
          disabled={submitting}
          variant="contained"
        >
          {saveLabel}
        </Button>
      </DialogActions>
    </>
  );
}

export function QuizEditorDialog({
  open,
  quiz,
  ...props
}: QuizEditorDialogProps) {
  const dialogKey = `${quiz?.quizId ?? "new"}-${open ? "open" : "closed"}`;

  return (
    <Dialog
      open={open}
      onClose={props.submitting ? undefined : props.onClose}
      maxWidth="lg"
      fullWidth
    >
      {open ? (
        <QuizEditorDialogContent key={dialogKey} quiz={quiz} {...props} />
      ) : null}
    </Dialog>
  );
}
