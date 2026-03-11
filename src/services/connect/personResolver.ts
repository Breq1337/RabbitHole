<<<<<<< HEAD
// Person resolver: query -> Person with batched/parallel fetch and concurrency control
=======
// Person resolver: query string -> Person (Wikipedia + Wikidata)
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f

import type { Person } from '@/types/connect';
import { searchWikidata, wikidataFetch } from '@/lib/wikidata';
import { getWikipediaSummary } from '@/lib/wikipedia';
import { getWikipediaUrl } from '@/lib/mediawiki';
import { getFromCache, setCache } from '@/lib/cache';

const HUMAN_QID = 'Q5';
<<<<<<< HEAD
const CONCURRENCY = 4;
const ENTITY_BATCH_SIZE = 10;

export interface PersonCandidate {
  id: string;
  canonicalName: string;
  wikipediaTitle?: string;
  image?: string;
  shortDescription?: string;
}

interface EntityMeta {
=======

async function getWikidataEntity(wikidataId: string): Promise<{
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
  label: string;
  description?: string;
  image?: string;
  isHuman: boolean;
  sitelinks?: { enwiki?: { title: string } };
<<<<<<< HEAD
}

async function getWikidataEntity(wikidataId: string): Promise<EntityMeta | null> {
=======
} | null> {
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
  try {
    const res = await wikidataFetch(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${wikidataId}&props=labels|descriptions|claims|sitelinks&languages=en&format=json&origin=*`
    );
    const text = await res.text();
    const ct = res.headers.get('content-type') ?? '';
<<<<<<< HEAD
    if (!ct.includes('application/json')) return null;
=======
    if (!ct.includes('application/json')) {
      return null;
    }
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
    const data = JSON.parse(text) as {
      entities?: Record<
        string,
        {
          missing?: string;
          labels?: { en?: { value: string } };
          descriptions?: { en?: { value: string } };
          claims?: {
            P31?: { mainsnak?: { datavalue?: { value?: { id?: string } } } }[];
            P18?: { mainsnak?: { datavalue?: { value?: string } } }[];
          };
          sitelinks?: { enwiki?: { title: string } };
        }
      >;
    };
    const entity = data.entities?.[wikidataId];
    if (!entity || entity.missing) return null;

    const instanceOf = entity.claims?.P31?.flatMap(
      (c) => c.mainsnak?.datavalue?.value?.id ?? []
    ) ?? [];
    const isHuman = instanceOf.includes(HUMAN_QID);
<<<<<<< HEAD
=======

>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
    const label = entity.labels?.en?.value ?? wikidataId;
    const description = entity.descriptions?.en?.value;
    let image: string | undefined;
    const P18 = entity.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
    if (P18) {
      const filename = encodeURIComponent(String(P18).replace(/ /g, '_'));
      image = `https://commons.wikimedia.org/wiki/Special:FilePath/${filename}?width=400`;
    }
<<<<<<< HEAD
    return { label, description, image, isHuman, sitelinks: entity.sitelinks };
=======
    const sitelinks = entity.sitelinks;

    return { label, description, image, isHuman, sitelinks };
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
  } catch {
    return null;
  }
}

<<<<<<< HEAD
/** Batch fetch entity meta for multiple IDs (one API call per batch). */
async function getWikidataEntityBatch(ids: string[]): Promise<Map<string, EntityMeta>> {
  const out = new Map<string, EntityMeta>();
  if (ids.length === 0) return out;
  const unique = [...new Set(ids)];
  for (let i = 0; i < unique.length; i += ENTITY_BATCH_SIZE) {
    const batch = unique.slice(i, i + ENTITY_BATCH_SIZE);
    const idsParam = batch.join('|');
    try {
      const res = await wikidataFetch(
        `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${idsParam}&props=labels|descriptions|claims|sitelinks&languages=en&format=json&origin=*`
      );
      const text = await res.text();
      if (!res.headers.get('content-type')?.includes('application/json')) continue;
      const data = JSON.parse(text) as {
        entities?: Record<
          string,
          {
            missing?: string;
            labels?: { en?: { value: string } };
            descriptions?: { en?: { value: string } };
            claims?: { P31?: { mainsnak?: { datavalue?: { value?: { id?: string } } } }[]; P18?: { mainsnak?: { datavalue?: { value?: string } } }[] };
            sitelinks?: { enwiki?: { title: string } };
          }
        >;
      };
      const entities = data.entities ?? {};
      for (const id of batch) {
        const e = entities[id];
        if (!e || e.missing) continue;
        const instanceOf = e.claims?.P31?.flatMap(
          (c: { mainsnak?: { datavalue?: { value?: { id?: string } } } }) =>
            c.mainsnak?.datavalue?.value?.id ?? []
        ) ?? [];
        const isHuman = instanceOf.includes(HUMAN_QID);
        const label = e.labels?.en?.value ?? id;
        const description = e.descriptions?.en?.value;
        let image: string | undefined;
        const P18 = e.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
        if (P18) {
          const filename = encodeURIComponent(String(P18).replace(/ /g, '_'));
          image = `https://commons.wikimedia.org/wiki/Special:FilePath/${filename}?width=400`;
        }
        out.set(id, { label, description, image, isHuman, sitelinks: e.sitelinks });
      }
    } catch {
      // skip batch
    }
  }
  return out;
}

/** Run async tasks with concurrency limit. */
async function pLimit<T>(items: (() => Promise<T>)[], concurrency: number): Promise<T[]> {
  const results: T[] = [];
  let index = 0;
  async function run(): Promise<void> {
    while (index < items.length) {
      const i = index++;
      results[i] = await items[i]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => run()));
  return results;
}

/**
 * Resolve query to lightweight candidates (no Wikipedia summary).
 * Good for autocomplete.
 */
export async function resolvePersonCandidates(
  query: string,
  limit = 8
): Promise<PersonCandidate[]> {
  const q = query.trim();
  if (!q) return [];

  const cacheKey = `connect:candidates:${q.toLowerCase()}`;
  const cached = getFromCache<PersonCandidate[]>(cacheKey);
  if (cached) return cached;

  const results = await searchWikidata(q, limit + 5);
  const ids = results.map((r) => r.id);
  const entityMap = await getWikidataEntityBatch(ids);

  const candidates: PersonCandidate[] = [];
  for (const r of results) {
    const entity = entityMap.get(r.id);
    if (!entity || !entity.isHuman) continue;
    candidates.push({
      id: r.id,
      canonicalName: entity.label,
      wikipediaTitle: entity.sitelinks?.enwiki?.title ?? r.label,
      image: entity.image,
      shortDescription: entity.description,
    });
    if (candidates.length >= limit) break;
  }

  setCache(cacheKey, candidates, 3600);
  return candidates;
}

/**
 * Hydrate full Person for given IDs (batch entity + parallel Wikipedia summary).
 */
export async function hydrateResolvedPeople(ids: string[]): Promise<Map<string, Person>> {
  const out = new Map<string, Person>();
  for (const id of ids) {
    const p = getFromCache<Person>(`connect:person:${id}`);
    if (p) out.set(id, p);
  }
  const toFetch = ids.filter((id) => !out.has(id));
  if (toFetch.length === 0) return out;

  const entityMap = await getWikidataEntityBatch(toFetch);
  const titles = toFetch.map((id) => {
    const e = entityMap.get(id);
    return e?.sitelinks?.enwiki?.title ?? e?.label ?? '';
  });

  const summaryTasks = titles.map((title, i) => async () => {
    if (!title) return null;
    return getWikipediaSummary(title).then((s) => ({ id: toFetch[i], summary: s }));
  });
  const summaryResults = await pLimit(summaryTasks, CONCURRENCY);

  for (let i = 0; i < toFetch.length; i++) {
    const id = toFetch[i]!;
    const entity = entityMap.get(id);
    if (!entity || !entity.isHuman) continue;
    const wikipediaTitle = entity.sitelinks?.enwiki?.title ?? entity.label;
    const summaryResult = summaryResults[i];
    const summary =
      summaryResult && typeof summaryResult === 'object' && 'summary' in summaryResult
        ? (summaryResult as { summary: { extract?: string; thumbnail?: { source: string } } }).summary
        : null;
    const person: Person = {
      id,
      canonicalName: entity.label,
      wikipediaTitle,
      wikipediaUrl: getWikipediaUrl(wikipediaTitle),
      image: entity.image ?? summary?.thumbnail?.source,
      shortDescription: entity.description ?? summary?.extract?.slice(0, 150),
    };
    setCache(`connect:person:${id}`, person, 3600);
    out.set(id, person);
  }

  return out;
}

/**
 * Get one resolved Person by ID (cache-first, then hydrate).
 */
export async function getResolvedPersonById(wikidataId: string): Promise<Person | null> {
  const cacheKey = `connect:person:${wikidataId}`;
  const cached = getFromCache<Person>(cacheKey);
  if (cached) return cached;

  const map = await hydrateResolvedPeople([wikidataId]);
  return map.get(wikidataId) ?? null;
}

/** Full resolve: candidates + hydrate first N (backward compatible). */
export async function resolvePerson(query: string, hydrateLimit = 5): Promise<Person[]> {
=======
export async function resolvePerson(query: string): Promise<Person[]> {
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
  const q = query.trim();
  if (!q) return [];

  const cacheKey = `connect:resolve:${q.toLowerCase()}`;
  const cached = getFromCache<Person[]>(cacheKey);
  if (cached) return cached;

<<<<<<< HEAD
  const candidates = await resolvePersonCandidates(q, hydrateLimit);
  if (candidates.length === 0) return [];

  const ids = candidates.map((c) => c.id);
  const peopleMap = await hydrateResolvedPeople(ids);
  const people = ids.map((id) => peopleMap.get(id)).filter((p): p is Person => p != null);
=======
  const results = await searchWikidata(q, 10);
  const people: Person[] = [];

  for (const r of results) {
    const entity = await getWikidataEntity(r.id);
    if (!entity || !entity.isHuman) continue;

    const wikipediaTitle = entity.sitelinks?.enwiki?.title ?? r.label;
    const summary = await getWikipediaSummary(wikipediaTitle);

    const person: Person = {
      id: r.id,
      canonicalName: entity.label,
      wikipediaTitle,
      wikipediaUrl: getWikipediaUrl(wikipediaTitle),
      image: entity.image ?? summary?.thumbnail?.source,
      shortDescription: entity.description ?? summary?.extract?.slice(0, 150),
    };
    people.push(person);
    if (people.length >= 5) break;
  }
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f

  setCache(cacheKey, people, 3600);
  return people;
}

export async function getPersonById(wikidataId: string): Promise<Person | null> {
<<<<<<< HEAD
  return getResolvedPersonById(wikidataId);
=======
  const cacheKey = `connect:person:${wikidataId}`;
  const cached = getFromCache<Person>(cacheKey);
  if (cached) return cached;

  const entity = await getWikidataEntity(wikidataId);
  if (!entity || !entity.isHuman) return null;

  const wikipediaTitle = entity.sitelinks?.enwiki?.title ?? entity.label;
  const summary = await getWikipediaSummary(wikipediaTitle);

  const person: Person = {
    id: wikidataId,
    canonicalName: entity.label,
    wikipediaTitle,
    wikipediaUrl: getWikipediaUrl(wikipediaTitle),
    image: entity.image ?? summary?.thumbnail?.source,
    shortDescription: entity.description ?? summary?.extract?.slice(0, 150),
  };

  setCache(cacheKey, person, 3600);
  return person;
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
}
