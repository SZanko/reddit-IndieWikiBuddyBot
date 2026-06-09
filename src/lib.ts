import sitesEN from "../assets/sitesEN.json" with { type: "json" };

type Site = (typeof sitesEN)[number];
type Origin = Site["origins"][number];

export interface SiteMatch {
  url: string;
  site: Site;
  origin: Origin;
}

function extractUrls(text: string): string[] {
  return text.match(/https?:\/\/[^\s)\]>"]+/g) ?? [];
}

function findMatchingSite(url: string): { site: Site; origin: Origin } | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const hostname = parsed.hostname.replace(/^www\./, "");

  for (const site of sitesEN) {
    for (const origin of site.origins) {
      if (
        hostname === origin.origin_base_url &&
        parsed.pathname.startsWith(origin.origin_content_path)
      ) {
        return { site, origin };
      }
    }
  }
  return null;
}

export function generateRedirectUrl(match: SiteMatch): string {
  const parsed = new URL(match.url);
  const slug = parsed.pathname.slice(match.origin.origin_content_path.length);
  const prefix =
    ("destination_content_prefix" in match.origin
      ? match.origin.destination_content_prefix
      : undefined) ??
    ("destination_content_prefix" in match.site
      ? match.site.destination_content_prefix
      : undefined) ??
    "";

  const dest = new URL(`https://${match.site.destination_base_url}`);
  dest.pathname = `${match.site.destination_content_path}${prefix}${slug}`;
  dest.search = parsed.search;
  dest.hash = parsed.hash;
  return dest.toString();
}

export function searchForLink(
  text: string,
  id: string,
  authorName: string,
  _context: unknown,
): SiteMatch[] {
  const matches: SiteMatch[] = [];
  if (authorName === "indie-buddy-wiki") {
    return matches;
  }

  const urls = extractUrls(text);

  for (const url of urls) {
    const match = findMatchingSite(url);
    if (match) {
      matches.push({ url, ...match });
    }
  }

  return matches;
}

export function formatComments(sites: SiteMatch[]): string {
  const lines = sites.map((match) => {
    const dest = generateRedirectUrl(match);
    return `* ${match.origin.origin} -> [${match.site.destination}](${dest})`;
  });

  const text = [
    "This post links to fandom wikis that have independent alternatives:",
    "",
    ...lines,
    "",
    "*I am a bot. | [Indie Wiki Buddy](https://getindie.wiki/)*",
  ].join("\n");

  return text;
}
