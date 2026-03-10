// Discovery engine: build graph + feed with direct, popular, unexpected relations

import type { Entity, GraphData, DiscoveryCard, ConnectionType } from '@/types';
import { getEntityWithRelations, getEntityImage, getEntityLabel, getEntityDescription } from './wikidata';
import { getWikipediaSummary } from './wikipedia';
import { getFromCache, setCache } from './cache';
import { generateInterestingFact } from './gemini';

const RELATION_PROPS = [
  'P31',  // instance of
  'P279', // subclass of
  'P361', // part of
  'P138', // named after
  'P106', // occupation
  'P27',  // country
  'P136', // genre
  'P17',  // country
  'P131', // located in
  'P576', // dissolved
  'P1365', // replaces
  'P1433', // published in
  'P50',  // author
  'P57',  // director
  'P86',  // composer
  'P166', // award
  'P737', // influenced by
];

// Some "unexpected" bridge concepts to surprise users
const UNEXPECTED_BRIDGES: Record<string, string[]> = {
  'Q5': ['Q8386', 'Q11190'],      // human -> philosophy, chemistry
  'Q16521': ['Q2539', 'Q7889'],   // taxon -> mathematics, fiction
  'Q7187': ['Q395', 'Q729'],      // gene -> mathematics, particle
};

function mapWikidataType(instanceOfIds: string[]): Entity['type'] {
  const id = instanceOfIds?.[0] || '';
  if (id.includes('Q5')) return 'person';
  if (id.includes('Q16521') || id.includes('Q7377')) return 'concept';
  if (id.includes('Q1190554') || id.includes('Q198')) return 'event';
  if (id.includes('Q82794') || id.includes('Q2221906')) return 'place';
  if (id.includes('Q571') || id.includes('Q11424')) return 'work';
  if (id.includes('Q11016')) return 'technology';
  return 'concept';
}

export async function entityToEntity(wikidataId: string): Promise<Entity | null> {
  const cacheKey = `entity:${wikidataId}`;
  const cached = getFromCache<Entity>(cacheKey);
  if (cached) return cached;

  try {
    const { entity: wd } = await getEntityWithRelations(wikidataId, RELATION_PROPS);
    const label = getEntityLabel(wd);
    const desc = getEntityDescription(wd);
    const image = getEntityImage(wd);

    const instanceOf = (wd.claims?.P31?.map((c) => c.mainsnak?.datavalue?.value?.id).filter((id): id is string => Boolean(id)) ?? []) as string[];
    const type = mapWikidataType(instanceOf);

    const entity: Entity = {
      id: wikidataId,
      name: label,
      description: desc,
      summary: desc,
      image: image || undefined,
      type,
      wikidataId,
    };
    setCache(cacheKey, entity, 3600);
    return entity;
  } catch {
    return null;
  }
}

export async function enrichEntityWithWikipedia(entity: Entity): Promise<Entity> {
  const title = entity.name;
  const summary = await getWikipediaSummary(title);
  if (summary) {
    entity.summary = summary.extract?.slice(0, 500) || entity.summary;
    entity.interestingFact = summary.extract?.slice(0, 200) || undefined;
    if (summary.thumbnail?.source) entity.image = summary.thumbnail.source;
    entity.wikipediaUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
  }
  // Enriquecer com Gemini: fato interessante se tiver chave e ainda não tiver um bom interestingFact
  try {
    const geminiFact = await generateInterestingFact(
      entity.name,
      entity.summary || entity.description
    );
    if (geminiFact && (!entity.interestingFact || entity.interestingFact.length < 50)) {
      entity.interestingFact = geminiFact;
    }
  } catch {
    // ignora falha do Gemini; mantém dados da Wikipédia
  }
  return entity;
}

export async function buildDiscoveryFromQuery(
  query: string,
  options: { limit?: number; includeUnexpected?: boolean } = {}
): Promise<{ graph: GraphData; feed: DiscoveryCard[]; centerEntity: Entity | null }> {
  const { searchWikidata } = await import('./wikidata');
  const results = await searchWikidata(query, 5);
  const first = results[0];
  if (!first) {
    return { graph: { nodes: [], links: [] }, feed: [], centerEntity: null };
  }
  return buildDiscoveryFromEntityId(first.id, options);
}

export async function buildDiscoveryFromEntityId(
  centerId: string,
  options: { limit?: number; includeUnexpected?: boolean } = {}
): Promise<{ graph: GraphData; feed: DiscoveryCard[]; centerEntity: Entity | null }> {
  const limit = options.limit ?? 22;
  const includeUnexpected = options.includeUnexpected ?? true;

  const centerEntity = await entityToEntity(centerId);
  if (!centerEntity) return { graph: { nodes: [], links: [] }, feed: [], centerEntity: null };

  await enrichEntityWithWikipedia(centerEntity);

  const nodes: GraphData['nodes'] = [
    { id: centerId, name: centerEntity.name, val: 20, group: 'center', entity: centerEntity },
  ];
  const links: GraphData['links'] = [];
  const feed: DiscoveryCard[] = [
    {
      id: centerId,
      title: centerEntity.name,
      image: centerEntity.image,
      summary: centerEntity.summary || centerEntity.description || '',
      interestingFact: centerEntity.interestingFact,
      entity: centerEntity,
    },
  ];

  try {
    const { entity: wd, relations } = await getEntityWithRelations(centerId, RELATION_PROPS);
    const direct = relations.slice(0, 10);
    const popular = relations.slice(10, 18);
    const unexpected: { id: string; label: string }[] = [];
    if (includeUnexpected && relations.length > 18) {
      unexpected.push(...relations.slice(18, 24));
    }

    const allRelated = [...direct, ...popular, ...unexpected].slice(0, limit);
    const seen = new Set<string>([centerId]);
    const directIds = new Set(direct.map((r) => r.id));

    for (const rel of allRelated) {
      if (seen.has(rel.id)) continue;
      seen.add(rel.id);
      const ent = await entityToEntity(rel.id);
      if (!ent) continue;
      await enrichEntityWithWikipedia(ent);
      nodes.push({
        id: rel.id,
        name: ent.name,
        val: 8,
        group: directIds.has(rel.id) ? 'direct' : 'related',
        entity: ent,
      });
      links.push({ source: centerId, target: rel.id, label: rel.label });
      feed.push({
        id: rel.id,
        title: ent.name,
        image: ent.image,
        summary: (ent.summary || ent.description || '').slice(0, 200),
        interestingFact: ent.interestingFact,
        entity: ent,
      });
    }

    return { graph: { nodes, links }, feed, centerEntity };
  } catch {
    return { graph: { nodes, links }, feed, centerEntity };
  }
}

export function getRandomTopic(): string {
  const topics = [
    'Albert Einstein', 'Nikola Tesla', 'Roman Empire', 'Black holes', 'Artificial intelligence',
    'Renaissance', 'Marie Curie', 'World War II', 'Photosynthesis', 'Leonardo da Vinci',
    'Quantum mechanics', 'Ancient Egypt', 'Climate change', 'Pablo Picasso', 'Apollo 11',
    'Charles Darwin', 'French Revolution', 'Solar system', 'Impressionism', 'Machine learning',
  ];
  return topics[Math.floor(Math.random() * topics.length)];
}
