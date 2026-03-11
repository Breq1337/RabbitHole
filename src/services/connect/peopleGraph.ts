// People graph: local/store first, staged extraction (Wikidata then Wikipedia), cap neighbors

import type { PersonEdge } from '@/types/connect';
import { getFromCache, setCache } from '@/lib/cache';
import { getDefaultGraphStore } from '@/lib/graphStore';
import { extractNeighbors } from './wikipediaExtractor';
import { extractWikidataEdges } from './wikidataExtractor';
import { mergeEdges, getTopNeighbors } from './relationNormalizer';
import { getPersonById } from './personResolver';

const TOP_K = 15;
const MIN_CONFIDENCE = 0.3;
const NEIGHBORS_TTL = 86400;

function reverseLabel(label: string): string {
  const map: Record<string, string> = {
    'married to': 'married to',
    'partner of': 'partner of',
    'family connection': 'family connection',
    'child of': 'parent of',
    father: 'child of',
    mother: 'child of',
    'mentored by': 'mentored',
    'coached by': 'coached',
    'connected to': 'connected to',
  };
  return map[label] ?? label;
}

/**
 * Stage 1: Wikidata only (high-confidence structured edges).
 * Stage 2: Wikipedia only if we have fewer than TOP_K unique targets.
 */
export async function getPrunedNeighbors(
  personId: string,
  wikipediaTitle?: string
): Promise<PersonEdge[]> {
  const cacheKey = `connect:neighbors:${personId}`;
  const cached = getFromCache<PersonEdge[]>(cacheKey);
  if (cached) return cached;

  const store = getDefaultGraphStore();
  const stored = await store.getEdges(personId);
  if (stored.length > 0) {
    const pruned = stored
      .filter((e) => e.confidence >= MIN_CONFIDENCE)
      .slice(0, TOP_K);
    if (pruned.length > 0) {
      setCache(cacheKey, pruned, NEIGHBORS_TTL);
      return pruned;
    }
  }

  const wdEdges = await extractWikidataEdges(personId);
  const uniqueWdTargets = new Set(wdEdges.map((e) => e.targetPersonId)).size;

  let wikiEdges: PersonEdge[] = [];
  if (uniqueWdTargets < TOP_K) {
    const title =
      wikipediaTitle ?? (await getPersonById(personId))?.wikipediaTitle;
    wikiEdges = title ? await extractNeighbors(title) : [];
  }
  const allEdges = mergeEdges(wikiEdges, wdEdges);

  const outgoing = allEdges.filter((e) => e.sourcePersonId === personId);
  const incoming = allEdges.filter((e) => e.targetPersonId === personId);

  const bidirectional: PersonEdge[] = [];
  for (const e of outgoing) bidirectional.push(e);
  for (const e of incoming) {
    bidirectional.push({
      ...e,
      sourcePersonId: e.targetPersonId,
      targetPersonId: e.sourcePersonId,
      relationLabel: reverseLabel(e.relationLabel),
    });
  }

  const pruned = getTopNeighbors(bidirectional, personId, TOP_K).filter(
    (e) => e.confidence >= MIN_CONFIDENCE
  );

  setCache(cacheKey, pruned, NEIGHBORS_TTL);
  await store.setEdges(personId, pruned);
  return pruned;
}

export async function getNeighborIds(
  personId: string,
  wikipediaTitle?: string
): Promise<string[]> {
  const edges = await getPrunedNeighbors(personId, wikipediaTitle);
  return [...new Set(edges.map((e) => e.targetPersonId))];
}
