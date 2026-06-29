import { describe, expect, it } from "vitest";
import { formatCount, formatEngagementRate, formatPlatformLabel, formatMonthLabel } from "@/lib/formatters";

describe("formatCount", () => {
  it("formats millions", () => {
    expect(formatCount(2_500_000)).toBe("2.5M");
  });
  it("formats thousands", () => {
    expect(formatCount(8_400)).toBe("8.4K");
  });
  it("formats small numbers as-is", () => {
    expect(formatCount(42)).toBe("42");
  });
  it("handles undefined", () => {
    expect(formatCount(undefined)).toBe("—");
  });
});

describe("formatEngagementRate", () => {
  it("converts a fraction to a percentage using *100 (regression test for the *10000 bug)", () => {
    // 0.0246 (2.46%) was previously rendered as "246.00%" due to a *10000 multiplier.
    expect(formatEngagementRate(0.0246)).toBe("2.46%");
  });
  it("handles undefined", () => {
    expect(formatEngagementRate(undefined)).toBe("N/A");
  });
});

describe("formatPlatformLabel", () => {
  it("title-cases known platforms", () => {
    expect(formatPlatformLabel("youtube")).toBe("YouTube");
    expect(formatPlatformLabel("instagram")).toBe("Instagram");
    expect(formatPlatformLabel("tiktok")).toBe("TikTok");
  });
});

describe("formatMonthLabel", () => {
  it("formats YYYY-MM into MMM YYYY", () => {
    expect(formatMonthLabel("2023-02")).toBe("Feb 2023");
    expect(formatMonthLabel("2023-12")).toBe("Dec 2023");
  });
  it("returns original string if malformed", () => {
    expect(formatMonthLabel("invalid")).toBe("invalid");
  });
});
