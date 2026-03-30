import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { QuestionItem } from "../../../types/question";
import { formatDateTime } from "../../../utils/date";
import { QuestionTypeChip } from "./QuestionTypeChip";

type QuestionsTableViewProps = {
  questions: QuestionItem[];
  locale: string;
  headers: {
    title: string;
    type: string;
    tags: string;
    version: string;
    updatedAt: string;
    actions: string;
  };
  noneLabel: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: (question: QuestionItem) => void;
  onDelete: (question: QuestionItem) => void;
};

export function QuestionsTableView({
  questions,
  locale,
  headers,
  noneLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: QuestionsTableViewProps) {
  return (
    <Paper variant="outlined" sx={{ overflowX: "auto" }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{headers.title}</TableCell>
            <TableCell>{headers.type}</TableCell>
            <TableCell>{headers.tags}</TableCell>
            <TableCell>{headers.version}</TableCell>
            <TableCell>{headers.updatedAt}</TableCell>
            <TableCell align="right">{headers.actions}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {questions.map((question) => (
            <TableRow key={question.questionId} hover>
              <TableCell>
                <Stack spacing={0.5}>
                  <Typography fontWeight={700}>{question.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {question.questionId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {question.statement}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <QuestionTypeChip type={question.type} />
              </TableCell>
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
                    <Chip label={noneLabel} size="small" variant="outlined" />
                  )}
                </Stack>
              </TableCell>
              <TableCell>{question.version}</TableCell>
              <TableCell>
                {formatDateTime(question.updatedAt, locale)}
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: "inline-flex", gap: 0.5 }}>
                  <IconButton
                    aria-label={editLabel}
                    onClick={() => onEdit(question)}
                  >
                    <EditRoundedIcon />
                  </IconButton>
                  <IconButton
                    aria-label={deleteLabel}
                    color="error"
                    onClick={() => onDelete(question)}
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
  );
}
