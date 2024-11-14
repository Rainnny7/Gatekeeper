import { describe, expect, it } from "bun:test";
import { dummy } from "../src";

describe("should", () => {
    it("export dummy", () => {
        expect(dummy).toBe("dummy");
    });
});
