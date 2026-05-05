import { useCallback, useState, type ChangeEvent } from "react";
import type { TFunction } from "i18next";
import type {
  GroupImportResult,
  GroupStudentOption,
} from "../../../types/group";

export type GroupImportFeedback = {
  severity: "error" | "success" | "info";
  message: string;
};

type UseGroupMembersImportOptions = {
  importMembers: (rawText: string) => Promise<GroupImportResult>;
  mergeSelectedStudents: (students: GroupStudentOption[]) => void;
  onFeedback: (feedback: GroupImportFeedback) => void;
  onReadError: (message: string) => void;
  t: TFunction;
};

export function useGroupMembersImport({
  importMembers,
  mergeSelectedStudents,
  onFeedback,
  onReadError,
  t,
}: UseGroupMembersImportOptions) {
  const [importRawText, setImportRawText] = useState("");
  const [importingMembers, setImportingMembers] = useState(false);
  const [importFileKey, setImportFileKey] = useState(0);

  const resetImportedContent = useCallback(() => {
    setImportRawText("");
    setImportFileKey((current) => current + 1);
  }, []);

  const importMembersFromRawText = useCallback(
    async (rawText: string) => {
      if (!rawText.trim()) {
        onFeedback({
          severity: "info",
          message: t("groups.import.validation.required"),
        });
        return;
      }

      setImportingMembers(true);

      try {
        const result = await importMembers(rawText);
        const {
          matchedStudents,
          missingIdentifiers,
          matchedCount,
          importedCount,
        } = result;

        if (matchedStudents.length > 0) {
          mergeSelectedStudents(matchedStudents);
        }

        resetImportedContent();

        if (matchedCount === 0) {
          onFeedback({
            severity: "info",
            message: t("groups.import.noMatches", { importedCount }),
          });
          return;
        }

        if (missingIdentifiers.length > 0) {
          onFeedback({
            severity: "info",
            message: t("groups.import.partialSuccess", {
              matchedCount,
              missingCount: missingIdentifiers.length,
            }),
          });
          return;
        }

        onFeedback({
          severity: "success",
          message: t("groups.import.success", { matchedCount }),
        });
      } finally {
        setImportingMembers(false);
      }
    },
    [importMembers, mergeSelectedStudents, onFeedback, resetImportedContent, t],
  );

  const handleImportFile = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      try {
        const rawText = await file.text();
        setImportRawText(rawText);
        await importMembersFromRawText(rawText);
      } catch {
        onReadError(t("groups.import.fileReadError"));
      } finally {
        event.target.value = "";
      }
    },
    [importMembersFromRawText, onReadError, t],
  );

  return {
    handleImportFile,
    importFileKey,
    importMembersFromRawText,
    importRawText,
    importingMembers,
    resetImportedContent,
    setImportRawText,
  };
}
