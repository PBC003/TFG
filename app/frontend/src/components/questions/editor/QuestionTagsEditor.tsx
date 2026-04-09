import { Button, Chip, Stack, TextField, Typography } from "@mui/material";

type QuestionTagsEditorProps = {
  label: string;
  newTagLabel: string;
  newTagValue: string;
  onNewTagChange: (nextValue: string) => void;
  onAddTag: () => void;
  tags: string[];
  onRemoveTag: (tag: string) => void;
  addTagLabel: string;
  placeholder: string;
  emptyText: string;
};

export function QuestionTagsEditor({
  label,
  newTagLabel,
  newTagValue,
  onNewTagChange,
  onAddTag,
  tags,
  onRemoveTag,
  addTagLabel,
  placeholder,
  emptyText,
}: QuestionTagsEditorProps) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle1" fontWeight={700}>
        {label}
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
        <TextField
          label={newTagLabel}
          value={newTagValue}
          onChange={(event) => onNewTagChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAddTag();
            }
          }}
          placeholder={placeholder}
          fullWidth
        />
        <Button variant="outlined" onClick={onAddTag} sx={{ minWidth: 150 }}>
          {addTagLabel}
        </Button>
      </Stack>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {tags.length > 0 ? (
          tags.map((tag) => (
            <Chip key={tag} label={tag} onDelete={() => onRemoveTag(tag)} />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            {emptyText}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
