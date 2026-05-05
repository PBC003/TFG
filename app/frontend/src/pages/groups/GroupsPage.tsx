import { Alert, Box, Card, CardContent, Stack, TextField } from "@mui/material";
import { GroupsPageHeaderCard } from "./components/GroupsPageHeaderCard";
import { GroupsTableCard } from "./components/GroupsTableCard";
import { GroupEditorDialog } from "./components/GroupEditorDialog";
import { useGroupsPage } from "./hooks/useGroupsPage";
import { useTranslation } from "react-i18next";

export default function GroupsPage() {
  const { t } = useTranslation();
  const {
    archiveGroup,
    closeEditor,
    description,
    duplicateNameExists,
    editorOpen,
    editingGroup,
    feedback,
    filteredGroups,
    handleImportFile,
    handleRowsPerPageChange,
    importFileKey,
    importMembersFromRawText,
    importRawText,
    importingMembers,
    loading,
    name,
    normalizedName,
    openCreate,
    openEdit,
    page,
    paginatedGroups,
    refreshGroups,
    rowsPerPage,
    search,
    selectedStudents,
    setDescription,
    setFeedback,
    setImportRawText,
    setName,
    setPage,
    setSearch,
    setSelectedStudents,
    studentLoading,
    students,
    submitEditor,
    submitting,
  } = useGroupsPage();

  return (
    <Box sx={{ width: "100%", maxWidth: 1180, mx: "auto" }}>
      <Stack spacing={3}>
        <GroupsPageHeaderCard
          onCreate={openCreate}
          onRefresh={() => {
            void refreshGroups();
          }}
          loading={loading}
          submitting={submitting}
          importingMembers={importingMembers}
        />

        {feedback ? (
          <Alert severity={feedback.severity} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        ) : null}

        <Card>
          <CardContent sx={{ p: 3 }}>
            <TextField
              label={t("groups.search")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              fullWidth
            />
          </CardContent>
        </Card>

        <GroupsTableCard
          filteredGroups={filteredGroups}
          loading={loading}
          onArchive={(group) => {
            void archiveGroup(group);
          }}
          onEdit={openEdit}
          onPageChange={setPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          page={page}
          paginatedGroups={paginatedGroups}
          rowsPerPage={rowsPerPage}
          submitting={submitting}
        />
      </Stack>

      <GroupEditorDialog
        description={description}
        duplicateNameExists={duplicateNameExists}
        editingGroup={editingGroup}
        editorOpen={editorOpen}
        handleImportFile={handleImportFile}
        importFileKey={importFileKey}
        importMembersFromRawText={importMembersFromRawText}
        importRawText={importRawText}
        importingMembers={importingMembers}
        name={name}
        normalizedName={normalizedName}
        onClose={closeEditor}
        onDescriptionChange={setDescription}
        onImportRawTextChange={setImportRawText}
        onNameChange={setName}
        onSelectedStudentsChange={setSelectedStudents}
        onSubmit={() => {
          void submitEditor();
        }}
        selectedStudents={selectedStudents}
        studentLoading={studentLoading}
        students={students}
        submitting={submitting}
      />
    </Box>
  );
}
