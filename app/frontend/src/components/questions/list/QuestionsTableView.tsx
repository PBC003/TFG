import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { MathText } from "../../math/MathText";
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
    <Box sx={{ width: "100%" }}>
      <Table sx={{ width: "100%", tableLayout: "fixed" }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: "40%" }}>{headers.title}</TableCell>
            <TableCell sx={{ width: "12%" }}>{headers.type}</TableCell>
            <TableCell sx={{ width: "18%" }}>{headers.tags}</TableCell>
            <TableCell sx={{ width: "8%" }}>{headers.version}</TableCell>
            <TableCell sx={{ width: "14%" }}>{headers.updatedAt}</TableCell>
            <TableCell align="center" sx={{ width: "8%", px: 2 }}>
              {headers.actions}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {questions.map((question) => (
            <TableRow key={question.questionId} hover>
              <TableCell sx={{ verticalAlign: "top" }}>
                <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                  <Typography
                    fontWeight={700}
                    sx={{ overflowWrap: "anywhere" }}
                  >
                    {question.title}
                  </Typography>
                  <Box
                    sx={{
                      typography: "body2",
                      color: "text.secondary",
                      minWidth: 0,
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
              </TableCell>
              <TableCell sx={{ verticalAlign: "top" }}>
                <QuestionTypeChip type={question.type} />
              </TableCell>
              <TableCell sx={{ verticalAlign: "top" }}>
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
              </TableCell>
              <TableCell sx={{ verticalAlign: "top", whiteSpace: "nowrap" }}>
                {question.version}
              </TableCell>
              <TableCell sx={{ verticalAlign: "top", whiteSpace: "nowrap" }}>
                {formatDateTime(question.updatedAt, locale)}
              </TableCell>
              <TableCell
                align="center"
                sx={{ verticalAlign: "top", whiteSpace: "nowrap", px: 2 }}
              >
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
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
    </Box>
  );
}
