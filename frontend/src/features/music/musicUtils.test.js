import test from "node:test";
import assert from "node:assert/strict";
import { filterLikedSongs, formatDuration, getDecade } from "./musicUtils.js";

const items = [
    { track: { name: "First", artists: [{ name: "Alpha" }], album: { release_date: "1978-01-01" } } },
    { track: { name: "Second", artists: [{ name: "Bravo" }], album: { release_date: "1995-01-01" } } },
    { track: { name: "Third", artists: [{ name: "Alpha" }], album: { release_date: "2023-01-01" } } },
];

test("liked song search, decade, and order preserve the displayed selection", () => {
    assert.deepEqual(filterLikedSongs(items, "alpha", "All", "newest"), [items[0], items[2]]);
    assert.deepEqual(filterLikedSongs(items, "", "90s", "newest"), [items[1]]);
    assert.deepEqual(filterLikedSongs(items, "", "All", "oldest"), [...items].reverse());
    assert.deepEqual(items.map(item => item.track.name), ["First", "Second", "Third"]);
});

test("music labels retain their existing date and duration formats", () => {
    assert.equal(getDecade("1978-01-01"), "70s");
    assert.equal(getDecade("2023-01-01"), "20s");
    assert.equal(formatDuration(185000), "3:05");
});
