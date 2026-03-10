// Wikidata API client - entities and relations

const WIKIDATA_API = 'https://www.wikidata.org/w/api.php';
const USER_AGENT = 'RabbitHole/1.0 (https://github.com/rabbithole; contact@example.com)';

export async function wikidataFetch(url: string): Promise<Response> {
  return fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  });
}

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  const text = await res.text();
  const ct = res.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) {
    throw new Error(`Wikidata API returned ${res.status}: expected JSON, got ${ct.split(';')[0]}`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Wikidata API returned invalid JSON (status ${res.status})`);
  }
}

export interface WikidataSearchResult {
  id: string;
  label: string;
  description?: string;
}

export interface WikidataEntity {
  id: string;
  labels: { [lang: string]: { value: string } };
  descriptions?: { [lang: string]: { value: string } };
  claims?: {
    P31?: Array<{ mainsnak?: { datavalue?: { value?: { id?: string } } } }>;
    P18?: Array<{ mainsnak?: { datavalue?: { value?: string } } }>;
    P569?: Array<{ mainsnak?: { datavalue?: { value?: string } } }>;
    P570?: Array<{ mainsnak?: { datavalue?: { value?: string } } }>;
  };
}

export async function searchWikidata(query: string, limit = 10): Promise<WikidataSearchResult[]> {
  try {
    const params = new URLSearchParams({
      action: 'wbsearchentities',
      search: query,
      language: 'en',
      limit: String(limit),
      format: 'json',
      origin: '*',
    });
    const res = await wikidataFetch(`${WIKIDATA_API}?${params}`);
    const data = await parseJsonOrThrow<{ search?: { id: string; label: string; description?: string }[] }>(res);
    return (data.search || []).map((s) => ({
      id: s.id,
      label: s.label,
      description: s.description,
    }));
  } catch (e) {
    console.warn('[Wikidata search]', e);
    return [];
  }
}

export async function getEntityWithRelations(
  entityId: string,
  relationProperties: string[] = ['P31', 'P279', 'P361', 'P138', 'P106', 'P27', 'P136', 'P17', 'P131', 'P576', 'P1365', 'P1433']
): Promise<{ entity: WikidataEntity; relations: { id: string; label: string; property: string }[] }> {
  const props = ['labels', 'descriptions', 'claims'].join('|');
  const params = new URLSearchParams({
    action: 'wbgetentities',
    ids: entityId,
    props,
    languages: 'en',
    format: 'json',
    origin: '*',
  });
  const res = await wikidataFetch(`${WIKIDATA_API}?${params}`);
  const data = await parseJsonOrThrow<{ entities?: Record<string, unknown> }>(res);
  const entities = data.entities || {};
  const entity = entities[entityId] as WikidataEntity & { missing?: string } | undefined;
  if (!entity || entity.missing) {
    throw new Error('Entity not found');
  }

  const relations: { id: string; label: string; property: string }[] = [];
  const claims = (entity.claims || {}) as Record<string, Array<{ mainsnak?: { datavalue?: { value?: { id?: string } } } }>>;

  for (const prop of relationProperties) {
    const claimList = claims[prop];
    if (!claimList) continue;
    for (const c of claimList.slice(0, 4)) {
      const value = c.mainsnak?.datavalue?.value;
      if (value?.id) {
        relations.push({ id: value.id, label: value.id, property: prop });
      }
    }
  }

  // Resolve labels for relation IDs in batch
  if (relations.length > 0) {
    const ids = [...new Set(relations.map((r) => r.id))].slice(0, 30);
    const labelParams = new URLSearchParams({
      action: 'wbgetentities',
      ids: ids.join('|'),
      props: 'labels',
      languages: 'en',
      format: 'json',
      origin: '*',
    });
    const labelRes = await wikidataFetch(`${WIKIDATA_API}?${labelParams}`);
    const labelData = await parseJsonOrThrow<{ entities?: Record<string, { labels?: { en?: { value: string } } }> }>(labelRes);
    const labelEntities = labelData.entities || {};
    for (const r of relations) {
      const e = labelEntities[r.id];
      if (e?.labels?.en?.value) r.label = e.labels.en.value;
    }
  }

  return { entity, relations };
}

export function getEntityImage(entity: WikidataEntity): string | undefined {
  const claims = entity.claims || {};
  const P18 = claims.P18?.[0]?.mainsnak?.datavalue?.value;
  if (P18) {
    const filename = encodeURIComponent(P18.replace(/ /g, '_'));
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${filename}?width=400`;
  }
  return undefined;
}

export function getEntityLabel(entity: WikidataEntity): string {
  return entity.labels?.en?.value || entity.id;
}

export function getEntityDescription(entity: WikidataEntity): string {
  return entity.descriptions?.en?.value || '';
}
