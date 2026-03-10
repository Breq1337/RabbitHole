// Wikipedia REST API - summaries and extracts

const WIKIPEDIA_API = 'https://en.wikipedia.org/api/rest_v1';

export interface WikipediaSummary {
  title: string;
  extract: string;
  thumbnail?: { source: string };
  pageid?: number;
}

export async function getWikipediaSummary(title: string): Promise<WikipediaSummary | null> {
  const normalized = title.replace(/ /g, '_');
  const encoded = encodeURIComponent(normalized);
  try {
    const res = await fetch(`${WIKIPEDIA_API}/page/summary/${encoded}`, {
      headers: { 'User-Agent': 'RabbitHole/1.0 (Knowledge Exploration)' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title || title,
      extract: data.extract || '',
      thumbnail: data.thumbnail,
      pageid: data.pageid,
    };
  } catch {
    return null;
  }
}

export async function getSummaryByWikidataId(wikidataId: string): Promise<WikipediaSummary | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&prop=pageprops|pageimages&titles=${wikidataId}&format=json&origin=*&ppprop=wikibase_item&piprop=original`
    );
    const data = await res.json();
    const pages = data.query?.pages || {};
    const page = Object.values(pages)[0] as { title?: string; pageid?: number };
    if (!page?.title) return null;
    return getWikipediaSummary(page.title);
  } catch {
    return null;
  }
}

export function getWikipediaUrl(title: string): string {
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
}
