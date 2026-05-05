import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import {
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { GroupItem } from "../../../types/group";
import { formatDateTime } from "../../../utils/date";

type GroupsTableCardProps = {
  filteredGroups: GroupItem[];
  loading: boolean;
  onArchive: (group: GroupItem) => void;
  onEdit: (group: GroupItem) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  page: number;
  paginatedGroups: GroupItem[];
  rowsPerPage: number;
  submitting: boolean;
};

export function GroupsTableCard({
  filteredGroups,
  loading,
  onArchive,
  onEdit,
  onPageChange,
  onRowsPerPageChange,
  page,
  paginatedGroups,
  rowsPerPage,
  submitting,
}: GroupsTableCardProps) {
  const { t, i18n } = useTranslation();

  return (
    <Card>
      {loading ? (
        <CardContent sx={{ p: 3 }}>
          <Typography color="text.secondary">{t("common.loading")}</Typography>
        </CardContent>
      ) : filteredGroups.length === 0 ? (
        <CardContent sx={{ p: 3 }}>
          <Typography color="text.secondary">{t("groups.empty")}</Typography>
        </CardContent>
      ) : (
        <>
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("groups.table.name")}</TableCell>
                  <TableCell>{t("groups.table.students")}</TableCell>
                  <TableCell>{t("groups.table.updatedAt")}</TableCell>
                  <TableCell align="right">{t("common.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedGroups.map((group) => (
                  <TableRow key={group.groupId} hover>
                    <TableCell sx={{ minWidth: 260 }}>
                      <Stack spacing={0.75}>
                        <Typography fontWeight={700}>{group.name}</Typography>
                        {group.description ? (
                          <Typography variant="body2" color="text.secondary">
                            {group.description}
                          </Typography>
                        ) : null}
                        <Stack direction="row" flexWrap="wrap" gap={0.75}>
                          {group.members.slice(0, 3).map((member) => (
                            <Chip
                              key={member.id}
                              label={member.fullName}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {group.memberCount > 3 ? (
                            <Chip
                              label={t("groups.membersOverflow", {
                                count: group.memberCount - 3,
                              })}
                              size="small"
                            />
                          ) : null}
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography>{group.memberCount}</Typography>
                    </TableCell>
                    <TableCell>
                      {formatDateTime(group.updatedAt, i18n.language)}
                    </TableCell>
                    <TableCell align="right" sx={{ minWidth: 220 }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Button
                          size="small"
                          startIcon={<EditRoundedIcon />}
                          onClick={() => onEdit(group)}
                        >
                          {t("common.edit")}
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteOutlineRoundedIcon />}
                          onClick={() => onArchive(group)}
                          disabled={submitting}
                        >
                          {t("groups.archiveAction")}
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredGroups.length}
            page={page}
            onPageChange={(_, nextPage) => onPageChange(nextPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              onRowsPerPageChange(Number.parseInt(event.target.value, 10));
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </>
      )}
    </Card>
  );
}
