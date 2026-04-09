import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import {
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { QuestionPreviewCard } from "../list/QuestionPreviewCard";

type QuestionMathFieldProps = {
  fieldKey: string;
  label: string;
  value: string;
  isPreview: boolean;
  onTogglePreview: (fieldKey: string) => void;
  onChange: (nextValue: string) => void;
  minRows?: number;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
};

export function QuestionMathField({
  fieldKey,
  label,
  value,
  isPreview,
  onTogglePreview,
  onChange,
  minRows = 2,
  helperText,
  required,
  placeholder,
}: QuestionMathFieldProps) {
  const { t } = useTranslation();
  const actionLabel = isPreview
    ? t("questions.dialogs.editField")
    : t("questions.dialogs.previewField");

  const action = (
    <Tooltip title={actionLabel}>
      <IconButton
        size="small"
        onClick={() => onTogglePreview(fieldKey)}
        aria-label={actionLabel}
      >
        {isPreview ? (
          <EditRoundedIcon fontSize="small" />
        ) : (
          <PreviewRoundedIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );

  if (isPreview) {
    return (
      <QuestionPreviewCard
        title={label}
        content={value}
        emptyText={t("questions.dialogs.previewEmpty")}
        caption={helperText}
        action={action}
      />
    );
  }

  return (
    <Stack spacing={0.75}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
      >
        <Typography variant="subtitle2" fontWeight={700}>
          {label}
        </Typography>
        {action}
      </Stack>
      <TextField
        value={value}
        onChange={(event) => onChange(event.target.value)}
        fullWidth
        multiline
        minRows={minRows}
        required={required}
        helperText={helperText}
        placeholder={placeholder}
        inputProps={{ "aria-label": label }}
      />
    </Stack>
  );
}
