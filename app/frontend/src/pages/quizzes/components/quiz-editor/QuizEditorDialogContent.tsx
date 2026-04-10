import {
  Alert,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { QuizEditorBasicSettingsSection } from "./QuizEditorBasicSettingsSection";
import { QuizEditorQuestionBankSection } from "./QuizEditorQuestionBankSection";
import type { QuizEditorDialogProps } from "./quiz-editor-dialog.types";
import { useQuizEditorDialog } from "../../hooks/useQuizEditorDialog";

type QuizEditorDialogContentProps = Omit<QuizEditorDialogProps, "open">;

export function QuizEditorDialogContent({
  quiz,
  questionBank,
  questionBankLoading = false,
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
  const {
    quizTitle,
    quizDescription,
    accessCode,
    attemptsAllowed,
    startAt,
    endAt,
    timeLimitMinutes,
    shuffleQuestions,
    revealAnswersAfterClose,
    search,
    selectedQuestions,
    selectedQuestionMap,
    localValidationMessage,
    questionPage,
    questionRowsPerPage,
    orderedQuestions,
    pagedQuestions,
    setQuizTitle,
    setQuizDescription,
    setAccessCode,
    setAttemptsAllowed,
    setStartAt,
    setEndAt,
    setTimeLimitMinutes,
    setShuffleQuestions,
    setRevealAnswersAfterClose,
    setSearch,
    setQuestionPage,
    setQuestionRowsPerPage,
    toggleQuestion,
    updateQuestionPoints,
    submit,
  } = useQuizEditorDialog({
    quiz,
    questionBank,
    validationMessage,
    fields,
    onSubmit,
  });

  return (
    <>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Typography color="text.secondary">{description}</Typography>

          {localValidationMessage ? (
            <Alert severity="warning">{localValidationMessage}</Alert>
          ) : null}

          <QuizEditorBasicSettingsSection
            fields={fields}
            submitting={submitting}
            quizTitle={quizTitle}
            quizDescription={quizDescription}
            accessCode={accessCode}
            attemptsAllowed={attemptsAllowed}
            startAt={startAt}
            endAt={endAt}
            timeLimitMinutes={timeLimitMinutes}
            shuffleQuestions={shuffleQuestions}
            revealAnswersAfterClose={revealAnswersAfterClose}
            onQuizTitleChange={setQuizTitle}
            onQuizDescriptionChange={setQuizDescription}
            onAccessCodeChange={setAccessCode}
            onAttemptsAllowedChange={setAttemptsAllowed}
            onStartAtChange={setStartAt}
            onEndAtChange={setEndAt}
            onTimeLimitMinutesChange={setTimeLimitMinutes}
            onShuffleQuestionsChange={setShuffleQuestions}
            onRevealAnswersAfterCloseChange={setRevealAnswersAfterClose}
          />

          <Divider />

          <QuizEditorQuestionBankSection
            submitting={submitting}
            loading={questionBankLoading}
            searchPlaceholder={searchPlaceholder}
            unsupportedTypeLabel={unsupportedTypeLabel}
            questionsSectionTitle={questionsSectionTitle}
            questionPointsLabel={questionPointsLabel}
            noQuestionsLabel={noQuestionsLabel}
            loadingLabel="Loading…"
            cancelLabel={cancelLabel}
            saveLabel={saveLabel}
            fields={fields}
            search={search}
            selectedQuestions={selectedQuestions}
            selectedQuestionMap={selectedQuestionMap}
            orderedQuestions={orderedQuestions}
            pagedQuestions={pagedQuestions}
            questionPage={questionPage}
            questionRowsPerPage={questionRowsPerPage}
            onSearchChange={(value) => {
              setSearch(value);
              setQuestionPage(0);
            }}
            onQuestionPageChange={setQuestionPage}
            onRowsPerPageChange={(rowsPerPage) => {
              setQuestionRowsPerPage(rowsPerPage);
              setQuestionPage(0);
            }}
            onToggleQuestion={toggleQuestion}
            onUpdateQuestionPoints={updateQuestionPoints}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          {cancelLabel}
        </Button>
        <Button
          onClick={() => void submit()}
          disabled={submitting || questionBankLoading}
          variant="contained"
        >
          {saveLabel}
        </Button>
      </DialogActions>
    </>
  );
}
