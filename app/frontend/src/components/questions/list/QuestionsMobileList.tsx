import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { MathText } from "../../math/MathText";
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
    <Stack spacing={1.5} sx={{ p: 2 }}>
      {questions.map((question) => (
        <Box key={question.questionId} sx={{ p: 0.25 }}>
          <Stack spacing={1.5}>
            <Stack spacing={0.75}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                gap={1}
              >
                <Typography fontWeight={700} sx={{ overflowWrap: "anywhere" }}>
                  {question.title}
                </Typography>
                <QuestionTypeChip type={question.type} />
              </Stack>
              <Box
                sx={{
                  typography: "body2",
                  color: "text.secondary",
                  maxWidth: "100%",
                  overflow: "hidden",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                  "& .katex-display": {
                    margin: 0,
                    maxWidth: "100%",
                    overflow: "hidden",
                  },
                  "& .katex": {
                    fontSize: "0.95em",
                    maxWidth: "100%",
                    whiteSpace: "normal",
                  },
                  "& .katex-html": {
                    maxWidth: "100%",
                    whiteSpace: "normal",
                  },
                }}
              >
                <MathText value={question.statement} />
              </Box>
            </Stack>

            <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
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
        </Box>
      ))}
    </Stack>
  );
}
