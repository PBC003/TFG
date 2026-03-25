import { describe, expect, it } from "vitest";
import { formatDateTime } from "../../../src/utils/date";

describe("formatDateTime", () => {
  it("returns an em dash when value is null", () => {
    expect(formatDateTime(null, "es")).toBe("—");
  });

  it("formats valid dates using Intl", () => {
    const value = "2026-03-10T18:30:00.000Z";
    const expected = new Intl.DateTimeFormat("es", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));

    expect(formatDateTime(value, "es")).toBe(expected);
  });
});
