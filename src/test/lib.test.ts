import { describe, it, expect } from "vitest";
import { searchForLink, generateRedirectUrl, formatComments } from "../lib.js";

const ctx = {};

describe("searchForLink", () => {
  it("returns empty array when authorName is indie-buddy-wiki", () => {
    const result = searchForLink(
      "https://minecraft.fandom.com/wiki/Creeper",
      "post_1",
      "indie-buddy-wiki",
      ctx,
    );
    expect(result).toEqual([]);
  });

  it("returns empty array when text has no URLs", () => {
    const result = searchForLink("just plain text", "post_1", "user", ctx);
    expect(result).toEqual([]);
  });

  it("returns empty array when URL matches no site", () => {
    const result = searchForLink(
      "https://example.com/page",
      "post_1",
      "user",
      ctx,
    );
    expect(result).toEqual([]);
  });

  it("matches a known fandom wiki URL", () => {
    const result = searchForLink(
      "check out https://minecraft.fandom.com/wiki/Creeper",
      "post_1",
      "user",
      ctx,
    );
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe("https://minecraft.fandom.com/wiki/Creeper");
    expect(result[0].site.id).toBe("en-minecraft");
    expect(result[0].origin.origin_base_url).toBe("minecraft.fandom.com");
  });

  it("does not match when path is not the wiki content path", () => {
    const result = searchForLink(
      "https://minecraft.fandom.com/forum/topic",
      "post_1",
      "user",
      ctx,
    );
    expect(result).toEqual([]);
  });

  it("strips www. prefix when matching", () => {
    const result = searchForLink(
      "https://www.minecraft.fandom.com/wiki/Diamond",
      "post_1",
      "user",
      ctx,
    );
    expect(result).toHaveLength(1);
    expect(result[0].site.id).toBe("en-minecraft");
  });

  it("returns multiple matches for multiple redirectable URLs", () => {
    const result = searchForLink(
      "see https://minecraft.fandom.com/wiki/Creeper and https://1000xresist.fandom.com/wiki/Iris",
      "post_1",
      "user",
      ctx,
    );
    expect(result).toHaveLength(2);
  });

  it("ignores non-matching URLs alongside matching ones", () => {
    const result = searchForLink(
      "see https://minecraft.fandom.com/wiki/Creeper and https://reddit.com/r/gaming",
      "post_1",
      "user",
      ctx,
    );
    expect(result).toHaveLength(1);
    expect(result[0].site.id).toBe("en-minecraft");
  });
});

describe("generateRedirectUrl", () => {
  function matchFirst(url: string) {
    return searchForLink(url, "post_1", "user", ctx)[0];
  }

  it("redirects a fandom wiki article to the indie wiki", () => {
    const match = matchFirst("https://minecraft.fandom.com/wiki/Creeper");
    expect(generateRedirectUrl(match)).toBe("https://minecraft.wiki/w/Creeper");
  });

  it("preserves query string and hash", () => {
    const match = matchFirst(
      "https://minecraft.fandom.com/wiki/Creeper?action=edit#History",
    );
    expect(generateRedirectUrl(match)).toBe(
      "https://minecraft.wiki/w/Creeper?action=edit#History",
    );
  });

  it("applies origin-level destination_content_prefix", () => {
    const match = matchFirst("https://skyrim.fandom.com/wiki/Dragon");
    expect(generateRedirectUrl(match)).toBe(
      "https://en.uesp.net/wiki/Skyrim:Dragon",
    );
  });
});

describe("formatComments", () => {
  function matchAll(text: string) {
    return searchForLink(text, "post_1", "user", ctx);
  }

  it("contains the header and bot footer", () => {
    const result = formatComments(
      matchAll("https://minecraft.fandom.com/wiki/Creeper"),
    );
    expect(result).toContain(
      "This post links to fandom wikis that have independent alternatives:",
    );
    expect(result).toContain("Indie Wiki Buddy");
  });

  it("includes the origin name and linked destination for a single match", () => {
    const result = formatComments(
      matchAll("https://minecraft.fandom.com/wiki/Creeper"),
    );
    expect(result).toContain("Minecraft Fandom Wiki");
    expect(result).toContain(
      "[Minecraft Wiki](https://minecraft.wiki/w/Creeper)",
    );
  });

  it("includes a line per match for multiple URLs", () => {
    const result = formatComments(
      matchAll(
        "https://minecraft.fandom.com/wiki/Creeper and https://1000xresist.fandom.com/wiki/Iris",
      ),
    );
    expect(result).toContain("Minecraft Fandom Wiki");
    expect(result).toContain("1000xRESIST Fandom Wiki");
  });
});
