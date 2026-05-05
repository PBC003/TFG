import { useCallback, useMemo, useState } from "react";
import type { GroupItem } from "../../../types/group";
import type { QuestionItem } from "../../../types/question";
import type {
  CreateQuizInput,
  QuizItem,
  UpdateQuizInput,
} from "../../../types/quiz";
import type {
  QuizEditorDialogProps,
  SelectedQuestionState,
} from "../components/quiz-editor/quiz-editor-dialog.types";
import {
  buildSelectedQuestionMap,
  hasUnsupportedQuizEditorQuestionType,
  orderQuizEditorQuestions,
  paginateQuizEditorQuestions,
  toggleQuizEditorQuestionSelection,
  updateQuizEditorQuestionPoints,
  updateQuizEditorQuestionQuantity,
  updateQuizEditorQuestionToleranceOverride,
} from "../utils/quiz-editor-selection.utils";
import { getInitialQuizEditorState } from "../utils/quiz-editor-dialog.utils";
import { buildQuizEditorPayload } from "../utils/quiz-editor-submit.utils";

export function useQuizEditorDialog({
  quiz,
  questionBank,
  groupOptions = [],
  validationMessage,
  fields,
  onSubmit,
}: {
  quiz: QuizItem | null;
  questionBank: QuestionItem[];
  groupOptions: GroupItem[];
  validationMessage: string | null;
  fields: QuizEditorDialogProps["fields"];
  onSubmit: (payload: CreateQuizInput | UpdateQuizInput) => Promise<void>;
}) {
  const initialState = useMemo(() => getInitialQuizEditorState(quiz), [quiz]);

  const [quizTitle, setQuizTitle] = useState(initialState.quizTitle);
  const [quizDescription, setQuizDescription] = useState(
    initialState.quizDescription,
  );
  const [accessCode, setAccessCode] = useState(initialState.accessCode);
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
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(
    initialState.selectedGroupIds,
  );
  const [search, setSearch] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<
    SelectedQuestionState[]
  >(initialState.selectedQuestions);
  const [localValidationMessage, setLocalValidationMessage] = useState<
    string | null
  >(null);
  const [questionPage, setQuestionPage] = useState(0);
  const [questionRowsPerPage, setQuestionRowsPerPage] = useState(5);

  const selectedQuestionMap = useMemo(
    () => buildSelectedQuestionMap(selectedQuestions),
    [selectedQuestions],
  );

  const orderedQuestions = useMemo(
    () => orderQuizEditorQuestions(questionBank, search, selectedQuestionMap),
    [questionBank, search, selectedQuestionMap],
  );

  const pagedQuestions = useMemo(
    () =>
      paginateQuizEditorQuestions(
        orderedQuestions,
        questionPage,
        questionRowsPerPage,
      ),
    [orderedQuestions, questionPage, questionRowsPerPage],
  );

  const selectedGroups = useMemo(
    () =>
      groupOptions.filter((group) => selectedGroupIds.includes(group.groupId)),
    [groupOptions, selectedGroupIds],
  );

  const toggleQuestion = useCallback((question: QuestionItem) => {
    setQuestionPage(0);
    setSelectedQuestions((current) =>
      toggleQuizEditorQuestionSelection(current, question),
    );
  }, []);

  const updateQuestionPoints = useCallback(
    (questionId: string, nextValue: string) => {
      setSelectedQuestions((current) =>
        updateQuizEditorQuestionPoints(current, questionId, nextValue),
      );
    },
    [],
  );

  const updateQuestionQuantity = useCallback(
    (questionId: string, nextValue: string) => {
      setSelectedQuestions((current) =>
        updateQuizEditorQuestionQuantity(current, questionId, nextValue),
      );
    },
    [],
  );

  const updateQuestionToleranceOverride = useCallback(
    (questionId: string, nextValue: string) => {
      setSelectedQuestions((current) =>
        updateQuizEditorQuestionToleranceOverride(
          current,
          questionId,
          nextValue,
        ),
      );
    },
    [],
  );

  const updateSelectedGroups = useCallback((groups: GroupItem[]) => {
    setSelectedGroupIds(groups.map((group) => group.groupId));
  }, []);

  const hasUnsupportedSelectedQuestion = hasUnsupportedQuizEditorQuestionType();

  const submit = useCallback(async () => {
    const { payload, validationMessage: nextValidationMessage } =
      buildQuizEditorPayload({
        quizTitle,
        quizDescription,
        accessCode,
        attemptsAllowed,
        startAt,
        endAt,
        timeLimitMinutes,
        shuffleQuestions,
        revealAnswersAfterClose,
        selectedQuestions,
        selectedGroupIds,
        hasUnsupportedSelectedQuestion,
        validationMessage,
        fields,
      });

    if (!payload) {
      setLocalValidationMessage(nextValidationMessage);
      return;
    }

    setLocalValidationMessage(null);
    await onSubmit(payload as CreateQuizInput | UpdateQuizInput);
  }, [
    accessCode,
    attemptsAllowed,
    endAt,
    fields,
    hasUnsupportedSelectedQuestion,
    onSubmit,
    quizDescription,
    quizTitle,
    revealAnswersAfterClose,
    selectedGroupIds,
    selectedQuestions,
    shuffleQuestions,
    startAt,
    timeLimitMinutes,
    validationMessage,
  ]);

  return {
    quizTitle,
    quizDescription,
    accessCode,
    attemptsAllowed,
    startAt,
    endAt,
    timeLimitMinutes,
    shuffleQuestions,
    revealAnswersAfterClose,
    selectedGroups,
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
    updateQuestionQuantity,
    updateQuestionToleranceOverride,
    updateSelectedGroups,
    submit,
  };
}
