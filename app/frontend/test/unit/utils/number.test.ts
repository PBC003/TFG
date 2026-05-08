import { describe, expect, it } from "vitest";
import {
  formatNumber,
  formatPercentValue,
  formatRawScore,
} from "../../../src/utils/number";

describe("number utils", () => {
  it("formats decimal numbers according to the active language", () => {
    expect(formatNumber(8.5, "es")).toBe("8,5");
    expect(formatNumber(8.5, "en")).toBe("8.5");
  });

  it("formats percentages and raw scores with localized decimals", () => {
    expect(formatPercentValue(66.67, "es")).toBe("66,67%");
    expect(formatRawScore(1.5, 2, "es")).toBe("1,5 / 2");
  });
});
