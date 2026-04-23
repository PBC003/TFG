import { useMemo, useState } from "react";
import type { GroupItem } from "../../../types/group";

const DEFAULT_ROWS_PER_PAGE = 5;

function matchesGroupSearch(group: GroupItem, normalizedSearch: string) {
  if (!normalizedSearch) {
    return true;
  }

  return (
    group.name.toLowerCase().includes(normalizedSearch) ||
    (group.description ?? "").toLowerCase().includes(normalizedSearch) ||
    group.members.some((member) =>
      member.fullName.toLowerCase().includes(normalizedSearch),
    )
  );
}

export function useGroupsPageFilters(groups: GroupItem[]) {
  const [search, setSearchState] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  const filteredGroups = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return groups.filter((group) =>
      matchesGroupSearch(group, normalizedSearch),
    );
  }, [groups, search]);

  const lastPage = useMemo(
    () => Math.max(0, Math.ceil(filteredGroups.length / rowsPerPage) - 1),
    [filteredGroups.length, rowsPerPage],
  );

  const currentPage = Math.min(page, lastPage);

  const paginatedGroups = useMemo(() => {
    const start = currentPage * rowsPerPage;
    return filteredGroups.slice(start, start + rowsPerPage);
  }, [filteredGroups, currentPage, rowsPerPage]);

  const handleRowsPerPageChange = (nextRowsPerPage: number) => {
    setRowsPerPage(nextRowsPerPage);
    setPage(0);
  };

  const handleSearchChange = (nextSearch: string) => {
    setSearchState(nextSearch);
    setPage(0);
  };

  return {
    filteredGroups,
    handleRowsPerPageChange,
    page: currentPage,
    paginatedGroups,
    rowsPerPage,
    search,
    setPage,
    setSearch: handleSearchChange,
  };
}
