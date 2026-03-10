// MediaWiki API - Wikipedia parse, query, links, categories

const MW_API = 'https://en.wikipedia.org/w/api.php';

const HEADERS = { 'User-Agent': 'RabbitHole/1.0 (Knowledge Exploration)' };

export interface ParsedPage {
  title: string;
  pageid: number;
  text: string;
  categories: string[];
  links: string[];
}

export async function fetchParse(
  title: string,
  props: string[] = ['text', 'categories', 'links']
): Promise<ParsedPage | null> {
  try {
    const params = new URLSearchParams({
      action: 'parse',
      page: title,
      prop: props.join('|'),
      format: 'json',
      origin: '*',
    });
    const res = await fetch(`${MW_API}?${params}`, { headers: HEADERS });
    if (!res.ok) return null;
    const data = (await res.json()) as { parse?: { title?: string; pageid?: number; text?: { '*'?: string }; categories?: { '*'?: string }[]; links?: { '*'?: string }[] } };
    const parse = data.parse;
    if (!parse) return null;

    const text = parse.text?.['*'] ?? '';
    const categories = (parse.categories ?? []).map((c) => c['*'] ?? '').filter(Boolean);
    const links = (parse.links ?? []).map((l) => l['*'] ?? '').filter(Boolean);

    return {
      title: parse.title ?? title,
      pageid: parse.pageid ?? 0,
      text,
      categories,
      links,
    };
  } catch {
    return null;
  }
}

export async function fetchPageRevisions(
  title: string,
  rvprop = 'content'
): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      action: 'query',
      titles: title,
      prop: 'revisions',
      rvprop,
      rvslots: 'main',
      format: 'json',
      origin: '*',
    });
    const res = await fetch(`${MW_API}?${params}`, { headers: HEADERS });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      query?: { pages?: Record<string, { revisions?: { slots?: { main?: { '*'?: string } } }[] }> };
    };
    const pages = data.query?.pages ?? {};
    const page = Object.values(pages)[0];
    const content = page?.revisions?.[0]?.slots?.main?.['*'];
    return content ?? null;
  } catch {
    return null;
  }
}

export async function fetchPageLinks(title: string, limit = 500): Promise<string[]> {
  try {
    const params = new URLSearchParams({
      action: 'query',
      titles: title,
      prop: 'links',
      pllimit: String(limit),
      format: 'json',
      origin: '*',
    });
    const res = await fetch(`${MW_API}?${params}`, { headers: HEADERS });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      query?: { pages?: Record<string, { links?: { title: string }[] }> };
    };
    const pages = data.query?.pages ?? {};
    const page = Object.values(pages)[0];
    const links = (page?.links ?? []).map((l) => l.title);
    return links;
  } catch {
    return [];
  }
}

export async function fetchPageCategories(title: string): Promise<string[]> {
  try {
    const params = new URLSearchParams({
      action: 'query',
      titles: title,
      prop: 'categories',
      cllimit: '50',
      format: 'json',
      origin: '*',
    });
    const res = await fetch(`${MW_API}?${params}`, { headers: HEADERS });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      query?: { pages?: Record<string, { categories?: { title: string }[] }> };
    };
    const pages = data.query?.pages ?? {};
    const page = Object.values(pages)[0];
    const cats = (page?.categories ?? []).map((c) => c.title.replace('Category:', ''));
    return cats;
  } catch {
    return [];
  }
}

export function getWikipediaUrl(title: string): string {
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
}

/** Get Wikidata Q-id from Wikipedia page title. Single API call. */
export async function getWikidataIdFromTitle(title: string): Promise<string | null> {
  try {
    const normalized = title.replace(/ /g, '_');
    const params = new URLSearchParams({
      action: 'query',
      titles: normalized,
      prop: 'pageprops',
      ppprop: 'wikibase_item',
      format: 'json',
      origin: '*',
    });
    const res = await fetch(`${MW_API}?${params}`, { headers: HEADERS });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      query?: { pages?: Record<string, { pageprops?: { wikibase_item?: string } }> };
    };
    const pages = data.query?.pages ?? {};
    const page = Object.values(pages)[0];
    return page?.pageprops?.wikibase_item ?? null;
  } catch {
    return null;
  }
}
