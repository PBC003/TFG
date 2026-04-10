import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  InputAdornment,
  Paper,
  Stack,
  TablePagination,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { PublicQuizCatalogItem } from "../../../types/quiz";
import { QUIZ_ROWS_PER_PAGE_OPTIONS } from "../utils/quiz-access.utils";
import { QuizCatalogCard } from "./QuizCatalogCard";

type QuizCatalogSectionProps = {
  loading: boolean;
  search: string;
  filteredCatalog: PublicQuizCatalogItem[];
  paginatedCatalog: PublicQuizCatalogItem[];
  page: number;
  rowsPerPage: number;
  selectedQuizId?: string;
  language: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onOpenQuiz: (quizId: string) => void;
};

export function QuizCatalogSection({
  loading,
  search,
  filteredCatalog,
  paginatedCatalog,
  page,
  rowsPerPage,
  selectedQuizId,
  language,
  onSearchChange,
  onPageChange,
  onRowsPerPageChange,
  onOpenQuiz,
}: QuizCatalogSectionProps) {
  const { t } = useTranslation();

  return (
    <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
          alignItems={{ md: "center" }}
        >
          <Stack spacing={0.5}>
            <Typography variant="h5" fontWeight={700}>
              {t("quizAccess.catalog.title")}
            </Typography>
            <Typography color="text.secondary">
              {t("quizAccess.catalog.subtitleWithParticipant")}
            </Typography>
          </Stack>
          <TextField
            label={t("quizAccess.catalog.searchLabel")}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            fullWidth
            sx={{ maxWidth: { xs: "100%", md: 360 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        {loading ? (
          <Typography color="text.secondary">{t("common.loading")}</Typography>
        ) : filteredCatalog.length === 0 ? (
          <Typography color="text.secondary">
            {t("quizAccess.catalog.empty")}
          </Typography>
        ) : (
          <>
            <Stack spacing={2}>
              {paginatedCatalog.map((quiz) => (
                <QuizCatalogCard
                  key={quiz.quizId}
                  quiz={quiz}
                  language={language}
                  isSelected={selectedQuizId === quiz.quizId}
                  onOpen={onOpenQuiz}
                />
              ))}
            </Stack>

            <TablePagination
              component="div"
              count={filteredCatalog.length}
              page={page}
              onPageChange={(_, nextPage) => onPageChange(nextPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                onRowsPerPageChange(Number.parseInt(event.target.value, 10));
              }}
              rowsPerPageOptions={QUIZ_ROWS_PER_PAGE_OPTIONS}
              labelRowsPerPage={t("quizAccess.catalog.paginationLabel")}
            />
          </>
        )}
      </Stack>
    </Paper>
  );
}
