import type { ChangeEvent } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useGroupMembersImport } from "../../../../../src/pages/groups/hooks/useGroupMembersImport";
import { createT } from "../../../../utils/i18n";

describe("useGroupMembersImport", () => {
  it("imports members, merges matches and emits partial-success feedback", async () => {
    const importMembers = vi.fn(async () => ({
      matchedStudents: [
        {
          id: 2,
          fullName: "Ada Lovelace",
          email: "uo000002@uniovi.es",
          uo: "UO000002",
        },
      ],
      missingIdentifiers: ["UO000099"],
      importedCount: 2,
      matchedCount: 1,
    }));
    const mergeSelectedStudents = vi.fn();
    const onFeedback = vi.fn();
    const onReadError = vi.fn();

    const { result } = renderHook(() =>
      useGroupMembersImport({
        importMembers,
        mergeSelectedStudents,
        onFeedback,
        onReadError,
        t: createT(),
      }),
    );

    await act(async () => {
      await result.current.importMembersFromRawText(
        "uo000002@uniovi.es\nUO000099",
      );
    });

    expect(importMembers).toHaveBeenCalledWith("uo000002@uniovi.es\nUO000099");
    expect(mergeSelectedStudents).toHaveBeenCalledTimes(1);
    expect(onFeedback).toHaveBeenCalledWith({
      severity: "info",
      message: "groups.import.partialSuccess",
    });
    expect(result.current.importRawText).toBe("");
  });

  it("surfaces file-read errors", async () => {
    const onReadError = vi.fn();
    const { result } = renderHook(() =>
      useGroupMembersImport({
        importMembers: vi.fn(async () => ({
          matchedStudents: [],
          missingIdentifiers: [],
          importedCount: 0,
          matchedCount: 0,
        })),
        mergeSelectedStudents: vi.fn(),
        onFeedback: vi.fn(),
        onReadError,
        t: createT(),
      }),
    );

    const fileInputEvent = {
      target: {
        files: [
          {
            text: vi.fn(async () => {
              throw new Error("boom");
            }),
          },
        ],
        value: "some-file.csv",
      },
    } as unknown as ChangeEvent<HTMLInputElement>;

    await act(async () => {
      await result.current.handleImportFile(fileInputEvent);
    });

    expect(onReadError).toHaveBeenCalledWith("groups.import.fileReadError");
    expect(fileInputEvent.target.value).toBe("");
  });
});
