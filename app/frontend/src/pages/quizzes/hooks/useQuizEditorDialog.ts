import { useMemo, useState } from "react";
import type { QuestionItem } from "../../../types/question";
import type { CreateQuizInput, UpdateQuizInput } from "../../../types/quiz";
import type {
  QuizEditorDialogProps,
  SelectedQuestionState,
} from "../components/quiz-editor/quiz-editor-dialog.types";
import {
  getInitialQuizEditorState,
  normalizeForSearch,
  toIsoDateTimeValue,
} from "../utils/quiz-editor-dialog.utils";

const UNSUPPORTED_QUIZ_TYPES = new Set(["parametric"]);

export function useQuizEditorDialog({
  quiz,
  questionBank,
  validationMessage,
  fields,
  onSubmit,
}: Pick<
  QuizEditorDialogProps,
  "quiz" | "questionBank" | "validationMessage" | "fields" | "onSubmit"
>) {
  const initialState = getInitialQuizEditorState(quiz);
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

      return question ? UNSUPPORTED_QUIZ_TYPES.has(question.type) : false;
    },
  );

  const submit = async () => {
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
    await onSubmit(payload as CreateQuizInput | UpdateQuizInput);
  };

  return {
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
  };
}
