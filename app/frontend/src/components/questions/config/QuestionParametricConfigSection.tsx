import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import {
  Alert,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MathText } from "../../../components/math/MathText";
import {
  buildCanonicalParametricStatement,
  generateParametricSampleInstance,
  PARAMETRIC_TEMPLATE_IDS,
} from "../../../utils/parametric-question.utils";
import type { FormState } from "../editor/question-editor.types";

type QuestionParametricConfigSectionProps = {
  form: FormState;
  onTemplateChange: (templateId: FormState["parametric"]["templateId"]) => void;
  onToleranceChange: (value: string) => void;
  onRegenerateSample: () => void;
};

export function QuestionParametricConfigSection({
  form,
  onTemplateChange,
  onToleranceChange,
  onRegenerateSample,
}: QuestionParametricConfigSectionProps) {
  const { t } = useTranslation();
  const sampleInstance = useMemo(() => {
    const regenerationSeed = form.parametric.sampleSeed;
    void regenerationSeed;

    return generateParametricSampleInstance({
      templateId: form.parametric.templateId,
      tolerance: Number.parseFloat(form.parametric.tolerance),
    });
  }, [
    form.parametric.sampleSeed,
    form.parametric.templateId,
    form.parametric.tolerance,
  ]);

  return (
    <Stack spacing={2}>
      <Alert severity="info">{t("questions.dialogs.parametricHelper")}</Alert>

      <TextField
        select
        label={t("questions.fields.parametricTemplate")}
        value={form.parametric.templateId}
        onChange={(event) =>
          onTemplateChange(
            event.target.value as FormState["parametric"]["templateId"],
          )
        }
        fullWidth
      >
        {PARAMETRIC_TEMPLATE_IDS.map((templateId) => (
          <MenuItem key={templateId} value={templateId}>
            {t(`questions.parametricTemplates.${templateId}`)}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label={t("questions.fields.parametricTolerance")}
        value={form.parametric.tolerance}
        onChange={(event) => onToleranceChange(event.target.value)}
        type="text"
        inputProps={{ inputMode: "decimal" }}
        helperText={t("questions.dialogs.parametricToleranceHelper")}
      />

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
        <Stack spacing={1.5}>
          <Typography variant="subtitle2" fontWeight={700}>
            {t("questions.dialogs.parametricCanonicalStatement")}
          </Typography>
          <MathText
            value={buildCanonicalParametricStatement(
              form.parametric.templateId,
            )}
            emptyText="—"
          />
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ sm: "center" }}
            spacing={1}
          >
            <Typography variant="subtitle2" fontWeight={700}>
              {t("questions.dialogs.parametricSampleTitle")}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AutorenewRoundedIcon />}
              onClick={onRegenerateSample}
            >
              {t("questions.actions.regenerateParametricSample")}
            </Button>
          </Stack>
          <MathText value={sampleInstance.statement} emptyText="—" />
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              {t("questions.dialogs.parametricReferenceAnswer")}
            </Typography>
            <MathText
              value={`$${sampleInstance.correctAnswerLatex}$`}
              emptyText="—"
            />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {t("questions.dialogs.parametricSampleTolerance", {
              tolerance: sampleInstance.tolerance,
            })}
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
}
