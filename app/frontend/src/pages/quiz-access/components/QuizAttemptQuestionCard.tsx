import {
  Card,
  CardContent,
  Chip,
  Divider,
  FormLabel,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { MathText } from "../../../components/math/MathText";
import type {
  PublicAttemptQuestion,
  QuizAnswerValue,
} from "../../../types/quiz";
import { QuizQuestionInput } from "./QuizQuestionInput";

type QuizAttemptQuestionCardProps = {
  question: PublicAttemptQuestion;
  index: number;
  value: QuizAnswerValue;
  disabled: boolean;
  onChange: (nextValue: QuizAnswerValue) => void;
  parametricValidationMessage?: string | null;
};

export function QuizAttemptQuestionCard({
  question,
  index,
  value,
  disabled,
  onChange,
  parametricValidationMessage,
}: QuizAttemptQuestionCardProps) {
  const { t } = useTranslation();

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent
        sx={{ p: { xs: 3, md: 4 }, "&:last-child": { pb: { xs: 3, md: 4 } } }}
      >
        <Stack spacing={2}>
          <Stack spacing={1.5}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              spacing={1}
            >
              <Typography variant="h6" fontWeight={700}>
                {t("quizAccess.questionTitle", { index: index + 1 })}
              </Typography>
              <Chip
                label={t("quizAccess.pointsLabel", { value: question.points })}
              />
            </Stack>
            <MathText value={question.statement} emptyText="—" />
          </Stack>

          <Divider />

          <Stack spacing={1.25}>
            <FormLabel>{t("quizAccess.yourAnswer")}</FormLabel>
            <QuizQuestionInput
              question={question}
              value={value}
              disabled={disabled}
              onChange={onChange}
              parametricValidationMessage={parametricValidationMessage}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
