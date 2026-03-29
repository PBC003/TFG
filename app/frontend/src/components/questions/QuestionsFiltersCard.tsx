import {
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { QuestionType } from "../../types/question";

export type QuestionTypeFilter = QuestionType | "all";

type QuestionsFiltersCardProps = {
  searchLabel: string;
  searchValue: string;
  onSearchChange: (nextValue: string) => void;
  typeFilterLabel: string;
  typeFilterValue: QuestionTypeFilter;
  onTypeFilterChange: (nextValue: QuestionTypeFilter) => void;
  typeFilters: QuestionTypeFilter[];
  getTypeLabel: (value: QuestionTypeFilter) => string;
  totalVisibleText: string;
};

export function QuestionsFiltersCard({
  searchLabel,
  searchValue,
  onSearchChange,
  typeFilterLabel,
  typeFilterValue,
  onTypeFilterChange,
  typeFilters,
  getTypeLabel,
  totalVisibleText,
}: QuestionsFiltersCardProps) {
  return (
    <Card>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <TextField
              label={searchLabel}
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              fullWidth
            />

            <TextField
              select
              label={typeFilterLabel}
              value={typeFilterValue}
              onChange={(event) =>
                onTypeFilterChange(event.target.value as QuestionTypeFilter)
              }
              sx={{ minWidth: { xs: "100%", md: 240 } }}
            >
              {typeFilters.map((value) => (
                <MenuItem key={value} value={value}>
                  {getTypeLabel(value)}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Typography color="text.secondary">{totalVisibleText}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
