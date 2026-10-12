import { describe, expect, it } from "vitest";
import { buildHomeLayout, groupBySection } from "../src/utils/homeLayout.js";
import { article } from "./fixtures.js";

const titles = (list) => list.map((item) => item.title);

describe("buildHomeLayout", () => {
  it("splits the stories into lead, secondary, spotlight and section rows", () => {
    const stories = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => article(n, { section: n > 6 ? "arts" : "world" }));
    const layout = buildHomeLayout(stories);

    expect(layout.lead.title).toBe("Story 1");
    expect(titles(layout.secondary)).toEqual(["Story 2", "Story 3", "Story 4"]);
    expect(titles(layout.spotlight)).toEqual(["Story 5", "Story 6"]);
    expect(layout.sections.map((group) => group.label)).toEqual(["Arts"]);
    expect(titles(layout.sections[0].articles)).toEqual(["Story 7", "Story 8"]);
  });

  it("moves opinion pieces to their own column", () => {
    const stories = [article(1, { section: "opinion" }), article(2), article(3, { section: "opinion" })];
    const layout = buildHomeLayout(stories);
    expect(titles(layout.opinion)).toEqual(["Story 1", "Story 3"]);
    expect(layout.lead.title).toBe("Story 2");
  });

  it("opens with the first story that has a photo", () => {
    const stories = [article(1, { image: null }), article(2), article(3)];
    const layout = buildHomeLayout(stories);
    expect(layout.lead.title).toBe("Story 2");
    expect(titles(layout.secondary)).toEqual(["Story 1", "Story 3"]);
  });

  it("collects sections with a single story in a final block", () => {
    const top = [1, 2, 3, 4, 5, 6].map((n) => article(n));
    const rest = [article(7, { section: "us" }), article(8, { section: "arts" }), article(9, { section: "us" }), article(10, { section: "briefing" })];
    const layout = buildHomeLayout([...top, ...rest]);
    expect(layout.sections.map((group) => group.label)).toEqual(["U.S.", "More Top Stories"]);
    expect(titles(layout.sections[1].articles)).toEqual(["Story 8", "Story 10"]);
  });

  it("works with an empty list", () => {
    expect(buildHomeLayout([])).toMatchObject({ lead: null, secondary: [], opinion: [], sections: [] });
  });
});

describe("groupBySection", () => {
  it("keeps the order of first appearance and links known sections", () => {
    const groups = groupBySection([
      article(1, { section: "us" }),
      article(2, { section: "books" }),
      article(3, { section: "us" }),
      article(4, { section: "climate" }),
    ]);
    expect(groups.map((group) => [group.label, group.slug, group.articles.length])).toEqual([
      ["U.S.", "us", 2],
      ["Books", "books", 1],
      ["Climate", null, 1],
    ]);
  });
});
