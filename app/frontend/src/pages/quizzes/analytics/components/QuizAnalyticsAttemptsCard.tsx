import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import {
  Box,
  Button,
  Card,
  CardContent,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type { QuizAnalyticsAttemptItem } from "../../../../types/quiz";
import { formatDateTime } from "../../../../utils/date";
import { formatRawScore } from "../../../../utils/number";
import { ATTEMPTS_ROWS_PER_PAGE_OPTIONS } from "../utils/quiz-analytics.utils";

type QuizAnalyticsAttemptsCardProps = {
  loading: boolean;
  detailLoading: boolean;
  allAttemptsCount: number;
  filteredAttemptsCount: number;
  attempts: QuizAnalyticsAttemptItem[];
  attemptSearch: string;
  attemptsPage: number;
  attemptsRowsPerPage: number;
  language: string;
  exportDisabled: boolean;
  labels: {
    title: string;
    subtitle: string;
    exportCsv: string;
    searchPlaceholder: string;
    empty: string;
    searchEmpty: string;
    participant: string;
    attempt: string;
    status: string;
    startedAt: string;
    submittedAt: string;
    score: string;
    viewDetail: string;
    rowsPerPage: string;
    actions: string;
  };
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onOpenDetail: (attemptId: string) => void;
  onExport: () => void;
  getStatusLabel: (status: string) => string;
};

export function QuizAnalyticsAttemptsCard({
  loading,
  detailLoading,
  allAttemptsCount,
  filteredAttemptsCount,
  attempts,
  attemptSearch,
  attemptsPage,
  attemptsRowsPerPage,
  language,
  exportDisabled,
  labels,
  onSearchChange,
  onPageChange,
  onRowsPerPageChange,
  onOpenDetail,
  onExport,
  getStatusLabel,
}: QuizAnalyticsAttemptsCardProps) {
  return (
    <Card>
      <CardContent sx={{ p: 0 }}>
        <Stack spacing={0}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            sx={{ px: 3, py: 2.5 }}
          >
            <Stack spacing={0.5}>
              <Typography variant="h6" fontWeight={800}>
                {labels.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {labels.subtitle}
              </Typography>
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              sx={{ width: { xs: "100%", md: "auto" } }}
            >
              <TextField
                size="small"
                value={attemptSearch}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={labels.searchPlaceholder}
                sx={{ width: { xs: "100%", md: 320 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                startIcon={<DownloadRoundedIcon />}
                onClick={onExport}
                disabled={exportDisabled}
                sx={{ whiteSpace: "nowrap" }}
              >
                {labels.exportCsv}
              </Button>
            </Stack>
          </Stack>
          {loading ? null : allAttemptsCount === 0 ? (
            <Box sx={{ px: 3, pb: 3 }}>
              <Typography color="text.secondary">{labels.empty}</Typography>
            </Box>
          ) : filteredAttemptsCount === 0 ? (
            <Box sx={{ px: 3, pb: 3 }}>
              <Typography color="text.secondary">
                {labels.searchEmpty}
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{labels.participant}</TableCell>
                      <TableCell>{labels.attempt}</TableCell>
                      <TableCell>{labels.status}</TableCell>
                      <TableCell>{labels.startedAt}</TableCell>
                      <TableCell>{labels.submittedAt}</TableCell>
                      <TableCell>{labels.score}</TableCell>
                      <TableCell align="right">{labels.actions}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attempts.map((attempt) => (
                      <TableRow key={attempt.attemptId} hover>
                        <TableCell>
                          <Typography fontWeight={700}>
                            {attempt.participantDisplayName}
                          </Typography>
                        </TableCell>
                        <TableCell>{attempt.attemptNumber}</TableCell>
                        <TableCell>{getStatusLabel(attempt.status)}</TableCell>
                        <TableCell>
                          {formatDateTime(attempt.startedAt, language)}
                        </TableCell>
                        <TableCell>
                          {formatDateTime(attempt.submittedAt, language)}
                        </TableCell>
                        <TableCell>
                          {formatRawScore(
                            attempt.earnedPoints,
                            attempt.maxPoints,
                            language,
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            startIcon={<VisibilityRoundedIcon />}
                            onClick={() => onOpenDetail(attempt.attemptId)}
                            disabled={detailLoading}
                          >
                            {labels.viewDetail}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
              <TablePagination
                component="div"
                count={filteredAttemptsCount}
                page={attemptsPage}
                onPageChange={(_, nextPage) => onPageChange(nextPage)}
                rowsPerPage={attemptsRowsPerPage}
                onRowsPerPageChange={(event) =>
                  onRowsPerPageChange(Number.parseInt(event.target.value, 10))
                }
                rowsPerPageOptions={ATTEMPTS_ROWS_PER_PAGE_OPTIONS}
                labelRowsPerPage={labels.rowsPerPage}
              />
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
