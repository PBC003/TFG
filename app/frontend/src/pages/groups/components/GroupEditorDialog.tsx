import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { ChangeEvent } from "react";
import type { GroupItem, GroupStudentOption } from "../../../types/group";

type GroupEditorDialogProps = {
  description: string;
  duplicateNameExists: boolean;
  editingGroup: GroupItem | null;
  editorOpen: boolean;
  feedback: {
    severity: "error" | "success" | "info";
    message: string;
  } | null;
  handleImportFile: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  importFileKey: number;
  importMembersFromRawText: (rawText: string) => Promise<void>;
  importRawText: string;
  importingMembers: boolean;
  name: string;
  normalizedName: string;
  onClose: () => void;
  onDescriptionChange: (value: string) => void;
  onFeedbackClose: () => void;
  onImportRawTextChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onSelectedStudentsChange: (value: GroupStudentOption[]) => void;
  onSubmit: () => void;
  selectedStudents: GroupStudentOption[];
  studentLoading: boolean;
  students: GroupStudentOption[];
  submitting: boolean;
};

export function GroupEditorDialog({
  description,
  duplicateNameExists,
  editingGroup,
  editorOpen,
  feedback,
  handleImportFile,
  importFileKey,
  importMembersFromRawText,
  importRawText,
  importingMembers,
  name,
  normalizedName,
  onClose,
  onDescriptionChange,
  onFeedbackClose,
  onImportRawTextChange,
  onNameChange,
  onSelectedStudentsChange,
  onSubmit,
  selectedStudents,
  studentLoading,
  students,
  submitting,
}: GroupEditorDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={editorOpen} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {editingGroup ? t("groups.editTitle") : t("groups.createTitle")}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          {feedback ? (
            <Alert severity={feedback.severity} onClose={onFeedbackClose}>
              {feedback.message}
            </Alert>
          ) : null}
          <TextField
            label={t("groups.fields.name")}
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            disabled={submitting}
            fullWidth
            required
            error={
              Boolean(normalizedName) &&
              (normalizedName.length < 3 || duplicateNameExists)
            }
            helperText={
              duplicateNameExists
                ? t("errors.codes.group.name_already_exists")
                : t("groups.validation.nameHelper")
            }
          />
          <TextField
            label={t("groups.fields.description")}
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            disabled={submitting}
            fullWidth
            multiline
            minRows={3}
          />
          <Stack spacing={1.5}>
            <Typography fontWeight={600}>{t("groups.import.title")}</Typography>
            <TextField
              label={t("groups.import.rawTextLabel")}
              value={importRawText}
              onChange={(event) => onImportRawTextChange(event.target.value)}
              disabled={submitting || importingMembers}
              fullWidth
              multiline
              minRows={4}
              helperText={t("groups.import.helper")}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <Button
                variant="outlined"
                component="label"
                disabled={submitting || importingMembers}
              >
                {t("groups.import.uploadAction")}
                <input
                  key={importFileKey}
                  hidden
                  type="file"
                  accept=".csv,.txt,text/csv,text/plain"
                  onChange={(event) => {
                    void handleImportFile(event);
                  }}
                />
              </Button>
              <Button
                variant="text"
                disabled={submitting || importingMembers}
                onClick={() => {
                  void importMembersFromRawText(importRawText);
                }}
              >
                {t("groups.import.importAction")}
              </Button>
            </Stack>
          </Stack>
          <Autocomplete
            multiple
            options={students}
            loading={studentLoading}
            value={selectedStudents}
            onChange={(_, value) => onSelectedStudentsChange(value)}
            getOptionLabel={(option) => `${option.fullName} (${option.uo})`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            filterSelectedOptions
            disableCloseOnSelect
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("groups.fields.students")}
                placeholder={t("groups.fields.studentsPlaceholder")}
                helperText={t("groups.fields.studentsHelper")}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          {t("common.cancel")}
        </Button>
        <Button onClick={onSubmit} variant="contained" disabled={submitting}>
          {editingGroup ? t("common.save") : t("common.create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
