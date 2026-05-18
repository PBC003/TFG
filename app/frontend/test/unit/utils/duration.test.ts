import { describe, expect, it } from "vitest";
import { formatDurationFromMinutes } from "../../../src/utils/duration";

const labels = {
  hour: "hora",
  hours: "horas",
  minute: "minuto",
  minutes: "minutos",
  second: "segundo",
  seconds: "segundos",
};

describe("formatDurationFromMinutes", () => {
  it("omits empty duration units", () => {
    expect(formatDurationFromMinutes(0.5, labels)).toBe("30 segundos");
    expect(formatDurationFromMinutes(1, labels)).toBe("1 minuto");
    expect(formatDurationFromMinutes(60, labels)).toBe("1 hora");
  });

  it("includes every non-empty duration unit", () => {
    expect(formatDurationFromMinutes(5.5, labels)).toBe(
      "5 minutos 30 segundos",
    );
    expect(formatDurationFromMinutes(63.25, labels)).toBe(
      "1 hora 3 minutos 15 segundos",
    );
  });

  it("rounds decimal minutes to the nearest second", () => {
    expect(formatDurationFromMinutes(0.73, labels)).toBe("44 segundos");
  });
});
