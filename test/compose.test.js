import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveProject } from "../lib/compose.js";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("compose", () => {
  it("resolves project", () => {
    const d = mkdtempSync(join(tmpdir(), "dsh-compose-"));
    assert.ok(resolveProject(d).includes("dsh-compose-"));
  });
});
