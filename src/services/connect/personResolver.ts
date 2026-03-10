// Person resolver: query string -> Person (Wikipedia + Wikidata)

import type { Person } from '@/types/connect';
import { searchWikidata, wikidataFetch } from '@/lib/wikidata';
import { getWikipediaSummary } from '@/lib/wikipedia';
import { getWikipediaUrl } from '@/lib/mediawiki';
import { getFromCache, setCache } from '@/lib/cache';

const HUMAN_QID = 'Q5';

async function getWikidataEntity(wikidataId: string): Promise<{
  label: string;
  description?: string;
  image?: string;
  isHuman: boolean;
  sitelinks?: { enwiki?: { title: string } };
} | null> {
  try {
    const res = await wikidataFetch(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${wikidataId}&props=labels|descriptions|claims|sitelinks&languages=en&format=json&origin=*`
    );
    const text = await res.text();
    const ct = res.headers.get('content-type') ?? '';
    if (!ct.includes('application/json')) {
      return null;
    }
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

    const label = entity.labels?.en?.value ?? wikidataId;
    const description = entity.descriptions?.en?.value;
    let image: string | undefined;
    const P18 = entity.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
    if (P18) {
      const filename = encodeURIComponent(String(P18).replace(/ /g, '_'));
      image = `https://commons.wikimedia.org/wiki/Special:FilePath/${filename}?width=400`;
    }
    const sitelinks = entity.sitelinks;

    return { label, description, image, isHuman, sitelinks };
  } catch {
    return null;
  }
}

export async function resolvePerson(query: string): Promise<Person[]> {
  const q = query.trim();
  if (!q) return [];

  const cacheKey = `connect:resolve:${q.toLowerCase()}`;
  const cached = getFromCache<Person[]>(cacheKey);
  if (cached) return cached;

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

  setCache(cacheKey, people, 3600);
  return people;
}

export async function getPersonById(wikidataId: string): Promise<Person | null> {
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
}
