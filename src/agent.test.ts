import { before, test } from "node:test";
import assert from "node:assert/strict";
import { assertAllowed, RecipientNotAllowedError } from "./sender.ts";
import { SessionCache } from "./sessionCache.ts";
import type { SentMessage } from "./store.ts";

before(() => {
  process.env.ALLOWED_NUMBER = "5555550100";
});

test("allows the permitted number in common formats", () => {
  for (const n of ["5555550100", "+1 (555) 555-0100", "555-555-0100", "15555550100"]) {
    assert.equal(assertAllowed(n), "5555550100");
  }
});

test("rejects other numbers", () => {
  for (const n of ["5555550101", "2125551234", "", "abc"]) {
    assert.throws(() => assertAllowed(n), RecipientNotAllowedError);
  }
});

test("cache refetches after ttl expires", () => {
  let time = 0;
  let loads = 0;
  const persisted: SentMessage[] = [];
  const cache = new SessionCache(
    600_000,
    () => time,
    () => {
      loads++;
      return [...persisted];
    },
    (_id, m) => persisted.push(m),
  );
  cache.add("s", { to: "x", text: "hi", sentAt: "t" });
  assert.equal(loads, 1);
  time = 599_000;
  assert.equal(cache.get("s").length, 1);
  assert.equal(loads, 1);
  time = 599_000 + 600_001;
  assert.equal(cache.get("s").length, 1);
  assert.equal(loads, 2);
});
