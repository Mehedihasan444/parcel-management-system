import { describe, it, expect } from "vitest";
import { calculatePrice, PRICE_TIERS } from "../src/lib/pricing.js";

describe("calculatePrice", () => {
  it("charges the 1kg and 2kg tiers", () => {
    expect(calculatePrice("1")).toBe(50);
    expect(calculatePrice("2")).toBe(100);
    expect(calculatePrice(1)).toBe(50);
    expect(calculatePrice(2)).toBe(100);
  });

  it("charges the flat rate above 2kg", () => {
    expect(calculatePrice("3")).toBe(150);
    expect(calculatePrice("2.5")).toBe(150);
    expect(calculatePrice(10)).toBe(150);
  });

  it("rejects zero, negative, empty and non-numeric weights", () => {
    for (const bad of ["0", "1.5", "-3", "", "  ", "abc", null, undefined, NaN]) {
      expect(calculatePrice(bad)).toBeNull();
    }
  });

  it("publishes tiers that match the calculator", () => {
    expect(PRICE_TIERS.map((t) => t.price)).toEqual([50, 100, 150]);
  });
});
