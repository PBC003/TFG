import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { QuestionType } from "../../../types/question";

type QuestionTypeChipProps = {
  type: QuestionType;
};

export function QuestionTypeChip({ type }: QuestionTypeChipProps) {
  const { t } = useTranslation();

  return <Chip size="small" label={t(`questions.types.${type}`)} />;
}
