import { describe, it, expect } from "vitest";
import { parseDecision } from "../src/llm/parser.js";

describe("decision parser", () => {
  it("parses valid decision", () => {
    const parsed = parseDecision('{"action":"SKIP","confidence":0.8,"reasons":["x"],"warnings":[],"notes":"ok"}');
    expect(parsed?.action).toBe("SKIP");
  });
  it("rejects invalid decision", () => {
    const parsed = parseDecision('{"action":"BUY","confidence":2}');
    expect(parsed).toBeNull();
  });
});
