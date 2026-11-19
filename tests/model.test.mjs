import { test } from "node:test";
import assert from "node:assert/strict";
import { atDepth, visitDates } from "../web/model.mjs";
test("preserve repeated readings and zeros; never interpolate absent values", () => {
  const rows = [
    ["2023-01-01", 0, 0],
    ["2023-01-01", 0, 2],
    ["2023-03-01", 0, null],
    ["2023-03-01", 4, 1],
  ];
  assert.deepEqual(atDepth(rows, "2023-01-01", 0, 2), [0, 2]);
  assert.deepEqual(atDepth(rows, "2023-03-01", 0, 2), []);
  assert.deepEqual(atDepth(rows, "2023-03-01", 3, 2), []);
  assert.deepEqual(visitDates(rows), ["2023-01-01", "2023-03-01"]);
});
