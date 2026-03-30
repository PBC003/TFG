import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { Button, Chip, Paper, Stack, Typography } from "@mui/material";
import type { QuestionItem } from "../../../types/question";
import { formatDateTime } from "../../../utils/date";
import { QuestionTypeChip } from "./QuestionTypeChip";

type QuestionsMobileListProps = {
  questions: QuestionItem[];
  locale: string;
  noneLabel: string;
  lastUpdatedLabel: (value: string) => string;
  editLabel: string;
  deleteLabel: string;
  onEdit: (question: QuestionItem) => void;
  onDelete: (question: QuestionItem) => void;
};

export function QuestionsMobileList({
  questions,
  locale,
  noneLabel,
  lastUpdatedLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: QuestionsMobileListProps) {
  return (
    <Stack spacing={1.5}>
      {questions.map((question) => (
        <Paper key={question.questionId} variant="outlined" sx={{ p: 2.25 }}>
          <Stack spacing={1.5}>
            <Stack spacing={0.75}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                gap={1}
              >
                <Typography fontWeight={700}>{question.title}</Typography>
                <QuestionTypeChip type={question.type} />
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
                <Chip label={noneLabel} size="small" variant="outlined" />
              )}
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {lastUpdatedLabel(formatDateTime(question.updatedAt, locale))}
            </Typography>

            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button
                size="small"
                startIcon={<EditRoundedIcon />}
                onClick={() => onEdit(question)}
              >
                {editLabel}
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteOutlineRoundedIcon />}
                onClick={() => onDelete(question)}
              >
                {deleteLabel}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
