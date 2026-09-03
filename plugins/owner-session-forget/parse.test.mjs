import assert from "node:assert/strict";
import {
	isUnderSessionsRoot,
	normalizeHex,
	normalizePrefs,
	parseForgetInput,
	whaleFill,
	withoutArchived
} from "./parse.js";

assert.deepEqual(parseForgetInput(""), { action: "help" });
assert.deepEqual(parseForgetInput("  list "), { action: "list" });
assert.deepEqual(parseForgetInput("confirm"), { action: "delete", sessionId: null });
assert.deepEqual(parseForgetInput("confirm abc-123"), { action: "delete", sessionId: "abc-123" });
assert.deepEqual(parseForgetInput("please"), { action: "help" });

assert.equal(isUnderSessionsRoot("D:\\Software\\dsh\\sessions\\Agent\\abc"), true);
assert.equal(isUnderSessionsRoot("D:\\Software\\dsh\\sessions"), true);
assert.equal(isUnderSessionsRoot("D:\\Software\\dsh\\settings.yaml"), false);
assert.equal(isUnderSessionsRoot("C:\\Windows"), false);

assert.equal(normalizePrefs(null).showPreviewBadge, true);
assert.equal(normalizePrefs(null).whalePreset, "gold");
assert.equal(normalizePrefs({ showPreviewBadge: false }).showPreviewBadge, false);
assert.equal(normalizePrefs({ whalePreset: "blue" }).whalePreset, "blue");
assert.equal(normalizePrefs({ whalePreset: "nope" }).whalePreset, "gold");
assert.equal(normalizeHex("#abc"), null);
assert.equal(normalizeHex("#4d6bfe"), "#4D6BFE");
assert.equal(whaleFill({ whalePreset: "blue" }), "#4D6BFE");
assert.equal(whaleFill({ whalePreset: "custom", whaleCustom: "#112233" }), "#112233");

assert.deepEqual(withoutArchived(["a", "b", "c"], "b"), ["a", "c"]);
assert.deepEqual(withoutArchived(["a"], "missing"), ["a"]);
assert.deepEqual(withoutArchived(undefined, "a"), []);

console.log("ok forget parse");
