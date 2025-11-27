import { describe, expect, it } from "vitest";
import { formatCurrency, slugify } from "@/lib/utils";

describe("utils", () => {
  it("formats currency values consistently", () => {
    expect(formatCurrency(129)).toBe("$129.00");
    expect(formatCurrency(49.5)).toBe("$49.50");
  });

  it("slugifies strings into kebab case", () => {
    expect(slugify("Loose Fit Hoodie")).toBe("loose-fit-hoodie");
    expect(slugify(" Festive Saree @ Capsule ")).toBe("festive-saree-capsule");
  });
});

