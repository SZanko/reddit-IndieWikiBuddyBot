import sitesEN from '../assets/sitesEN.json' with { type: 'json' };

type Site = (typeof sitesEN)[number];
type Origin = Site["origins"][number];

export type SiteMatch = {
    url: string;
    site: Site;
    origin: Origin;
};

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

export async function searchForLink(
    text: string,
    id: string,
    authorName: string,
    context: any
): Promise<SiteMatch[]> {
    const matches: SiteMatch[] = [];
    if(authorName === "indie-buddy-wiki") {
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