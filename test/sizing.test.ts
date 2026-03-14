import { describe, it, expect } from "vitest";
import { sizePosition } from "../src/strategy/sizing.js";

describe("size position", () => {
  it("caps by balance fraction", () => {
    expect(sizePosition(2, 1, 3)).toBeLessThanOrEqual(0.9);
  });
});
