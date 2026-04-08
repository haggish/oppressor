import { describe, expect, it } from "bun:test";
import { isInBlockWindow } from "../services/scheduler";

describe("isInBlockWindow", () => {
  describe("same-day window (09:00 → 17:00)", () => {
    const from = "09:00";
    const until = "17:00";

    it("returns true inside the window", () => {
      expect(isInBlockWindow("12:00", from, until)).toBe(true);
      expect(isInBlockWindow("09:00", from, until)).toBe(true); // at start (inclusive)
      expect(isInBlockWindow("16:59", from, until)).toBe(true);
    });

    it("returns false outside the window", () => {
      expect(isInBlockWindow("08:59", from, until)).toBe(false);
      expect(isInBlockWindow("17:00", from, until)).toBe(false); // at end (exclusive)
      expect(isInBlockWindow("23:00", from, until)).toBe(false);
    });
  });

  describe("overnight window (23:00 → 06:00)", () => {
    const from = "23:00";
    const until = "06:00";

    it("returns true after the start (same day)", () => {
      expect(isInBlockWindow("23:00", from, until)).toBe(true);
      expect(isInBlockWindow("23:30", from, until)).toBe(true);
    });

    it("returns true before the end (next day)", () => {
      expect(isInBlockWindow("00:00", from, until)).toBe(true);
      expect(isInBlockWindow("03:00", from, until)).toBe(true);
      expect(isInBlockWindow("05:59", from, until)).toBe(true);
    });

    it("returns false outside the window", () => {
      expect(isInBlockWindow("06:00", from, until)).toBe(false); // at end (exclusive)
      expect(isInBlockWindow("12:00", from, until)).toBe(false);
      expect(isInBlockWindow("22:59", from, until)).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("handles midnight-spanning window ending at midnight", () => {
      expect(isInBlockWindow("23:30", "22:00", "00:00")).toBe(true);
      expect(isInBlockWindow("00:00", "22:00", "00:00")).toBe(false);
    });

    it("handles single-hour window", () => {
      expect(isInBlockWindow("14:00", "14:00", "15:00")).toBe(true);
      expect(isInBlockWindow("14:59", "14:00", "15:00")).toBe(true);
      expect(isInBlockWindow("15:00", "14:00", "15:00")).toBe(false);
    });
  });
});
