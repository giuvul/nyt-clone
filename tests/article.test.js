import { describe, expect, it } from "vitest";
import { fromPopular, fromSearchDoc, fromTopStory, mapArticles } from "../src/models/article.js";
import { rawPopular, rawSearchDoc, rawTopStory } from "./fixtures.js";

describe("fromTopStory", () => {
  it("extracts the fields used by the interface", () => {
    const article = fromTopStory(rawTopStory(1, { kicker: "Analysis" }));
    expect(article).toMatchObject({
      id: "nyt://article/1",
      url: "https://www.nytimes.com/2026/10/12/world/story-1.html",
      title: "Top story 1",
      abstract: "Abstract of story 1.",
      byline: "By Reporter 1",
      section: "world",
      kicker: "Analysis",
      publishedAt: "2026-10-12T12:00:00.000Z",
    });
  });

  it("picks the right image format for each size", () => {
    const { image } = fromTopStory(rawTopStory(2));
    expect(image.large).toContain("2-superJumbo");
    expect(image.medium).toContain("2-threeByTwoSmallAt2X");
    expect(image.square).toContain("2-thumbLarge");
    expect(image.caption).toBe("Caption 2");
    expect(image.credit).toBe("Photographer 2");
  });

  it("falls back to the available format when others are missing", () => {
    const raw = rawTopStory(3);
    raw.multimedia = [raw.multimedia[1]];
    const { image } = fromTopStory(raw);
    expect(image.large).toContain("threeByTwoSmallAt2X");
    expect(image.square).toContain("threeByTwoSmallAt2X");
  });

  it("returns a null image when multimedia is null", () => {
    expect(fromTopStory(rawTopStory(4, { multimedia: null })).image).toBeNull();
  });

  it("discards empty promo items without title or url", () => {
    expect(fromTopStory(rawTopStory(5, { title: "", url: "" }))).toBeNull();
    expect(fromTopStory(null)).toBeNull();
  });

  it("uses updated_date when published_date is invalid", () => {
    const article = fromTopStory(rawTopStory(6, { published_date: "not a date" }));
    expect(article.publishedAt).toBe("2026-10-12T14:00:00.000Z");
  });
});

describe("fromPopular", () => {
  it("reads photos from media-metadata", () => {
    const article = fromPopular(rawPopular(1));
    expect(article.title).toBe("Popular story 1");
    expect(article.image.medium).toContain("p1-mediumThreeByTwo440");
    expect(article.image.square).toContain("p1-thumbStandard");
    expect(article.image.credit).toBe("Agency 1");
  });

  it("handles articles without media", () => {
    expect(fromPopular(rawPopular(2, { media: [] })).image).toBeNull();
  });
});

describe("fromSearchDoc", () => {
  it("reads the current multimedia format", () => {
    const article = fromSearchDoc(rawSearchDoc(1));
    expect(article).toMatchObject({
      title: "Search result 1",
      byline: "By Author 1",
      section: "Climate",
      url: "https://www.nytimes.com/2026/10/10/climate/search-1.html",
    });
    expect(article.image.large).toContain("s1-articleLarge");
    expect(article.image.square).toContain("s1-thumbStandard");
  });

  it("reads the older multimedia array with relative urls", () => {
    const article = fromSearchDoc(
      rawSearchDoc(2, {
        multimedia: [
          { url: "images/2020/01/01/xlarge.jpg", subtype: "xlarge" },
          { url: "images/2020/01/01/thumb.jpg", subtype: "thumbnail" },
        ],
      }),
    );
    expect(article.image.large).toBe("https://static01.nyt.com/images/2020/01/01/xlarge.jpg");
    expect(article.image.square).toBe("https://static01.nyt.com/images/2020/01/01/thumb.jpg");
  });

  it("uses the snippet when the abstract is empty", () => {
    expect(fromSearchDoc(rawSearchDoc(3, { abstract: "" })).abstract).toBe("Snippet 3.");
  });
});

describe("mapArticles", () => {
  it("skips invalid items and duplicates by url", () => {
    const list = [rawTopStory(1), rawTopStory(1), rawTopStory(2, { title: "" }), rawTopStory(3)];
    expect(mapArticles(list, fromTopStory).map((article) => article.title)).toEqual(["Top story 1", "Top story 3"]);
  });

  it("returns an empty list for missing results", () => {
    expect(mapArticles(undefined, fromTopStory)).toEqual([]);
  });
});
