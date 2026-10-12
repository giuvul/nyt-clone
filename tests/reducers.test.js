import { describe, expect, it } from "vitest";
import { initialNewsState, newsReducer } from "../src/store/newsReducer.js";
import { MAX_SAVED, parseSaved, savedReducer } from "../src/store/savedReducer.js";
import { article } from "./fixtures.js";

describe("newsReducer", () => {
  it("tracks a request from loading to success", () => {
    let state = newsReducer(initialNewsState, { type: "request", key: "topstories/home" });
    expect(state["topstories/home"].status).toBe("loading");

    state = newsReducer(state, { type: "success", key: "topstories/home", data: { articles: [1] }, at: 5 });
    expect(state["topstories/home"]).toEqual({ status: "success", data: { articles: [1] }, error: null, updatedAt: 5 });
  });

  it("keeps the previous data while reloading and after an error", () => {
    let state = newsReducer(initialNewsState, { type: "success", key: "k", data: "old", at: 1 });
    state = newsReducer(state, { type: "request", key: "k" });
    expect(state.k.data).toBe("old");
    state = newsReducer(state, { type: "failure", key: "k", error: "Boom" });
    expect(state.k).toMatchObject({ status: "error", data: "old", error: "Boom" });
  });

  it("does not touch other keys", () => {
    const state = newsReducer({ a: { status: "success" } }, { type: "request", key: "b" });
    expect(state.a).toEqual({ status: "success" });
  });
});

describe("savedReducer", () => {
  it("adds an article on top and removes it on the second toggle", () => {
    let state = savedReducer([article(1)], { type: "toggle", article: article(2), at: 10 });
    expect(state.map((item) => item.id)).toEqual(["nyt://article/2", "nyt://article/1"]);
    expect(state[0].savedAt).toBe(10);

    state = savedReducer(state, { type: "toggle", article: article(2), at: 11 });
    expect(state.map((item) => item.id)).toEqual(["nyt://article/1"]);
  });

  it("removes and clears", () => {
    const state = [article(1), article(2)];
    expect(savedReducer(state, { type: "remove", id: "nyt://article/1" })).toHaveLength(1);
    expect(savedReducer(state, { type: "clear" })).toEqual([]);
  });

  it("keeps at most MAX_SAVED articles", () => {
    const full = Array.from({ length: MAX_SAVED }, (_, n) => article(n));
    expect(savedReducer(full, { type: "toggle", article: article("new"), at: 1 })).toHaveLength(MAX_SAVED);
  });
});

describe("parseSaved", () => {
  it("restores valid articles and drops broken ones", () => {
    const json = JSON.stringify([article(1), { id: "x" }, null]);
    expect(parseSaved(json).map((item) => item.id)).toEqual(["nyt://article/1"]);
  });

  it("starts empty with corrupted data", () => {
    expect(parseSaved("{not json")).toEqual([]);
    expect(parseSaved('{"a":1}')).toEqual([]);
  });
});
