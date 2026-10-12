import { describe, expect, it } from "vitest";
import { formatArticleDate, formatMastheadDate, formatTimeAgo } from "../src/utils/format.js";

describe("formatMastheadDate", () => {
  it("writes the full date like the printed masthead", () => {
    expect(formatMastheadDate(new Date(2026, 9, 12))).toBe("Monday, October 12, 2026");
  });
});

describe("formatArticleDate", () => {
  it("uses AP style month abbreviations", () => {
    expect(formatArticleDate(new Date(2026, 9, 12).toISOString())).toBe("Oct. 12, 2026");
    expect(formatArticleDate(new Date(2026, 8, 3).toISOString())).toBe("Sept. 3, 2026");
    expect(formatArticleDate(new Date(2026, 4, 1).toISOString())).toBe("May 1, 2026");
  });

  it("returns an empty string for missing or invalid dates", () => {
    expect(formatArticleDate(null)).toBe("");
    expect(formatArticleDate("nope")).toBe("");
  });
});

describe("formatTimeAgo", () => {
  const now = new Date("2026-10-12T12:00:00Z");

  it("describes recent times", () => {
    expect(formatTimeAgo("2026-10-12T11:59:30Z", now)).toBe("Just now");
    expect(formatTimeAgo("2026-10-12T11:48:00Z", now)).toBe("12 min ago");
    expect(formatTimeAgo("2026-10-12T09:00:00Z", now)).toBe("3h ago");
  });

  it("shows the date after a day", () => {
    expect(formatTimeAgo("2026-10-10T12:00:00Z", now)).toBe(formatArticleDate("2026-10-10T12:00:00Z"));
  });

  it("handles missing dates", () => {
    expect(formatTimeAgo(null, now)).toBe("");
  });
});
