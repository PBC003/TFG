import {
  Alert,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
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
    requiresAccessCode,
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
    setRequiresAccessCode,
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
            requiresAccessCode={requiresAccessCode}
            attemptsAllowed={attemptsAllowed}
            startAt={startAt}
            endAt={endAt}
            timeLimitMinutes={timeLimitMinutes}
            shuffleQuestions={shuffleQuestions}
            revealAnswersAfterClose={revealAnswersAfterClose}
            onQuizTitleChange={setQuizTitle}
            onQuizDescriptionChange={setQuizDescription}
            onAccessCodeChange={setAccessCode}
            onRequiresAccessCodeChange={setRequiresAccessCode}
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
            searchPlaceholder={searchPlaceholder}
            unsupportedTypeLabel={unsupportedTypeLabel}
            questionsSectionTitle={questionsSectionTitle}
            questionPointsLabel={questionPointsLabel}
            noQuestionsLabel={noQuestionsLabel}
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
          disabled={submitting}
          variant="contained"
        >
          {saveLabel}
        </Button>
      </DialogActions>
    </>
  );
}
