// Normalize edges, map types, deduplicate

import type { PersonEdge, RelationType } from '@/types/connect';

const MIN_CONFIDENCE = 0.3;
const TOP_NEIGHBORS = 15;

export function normalizeEdges(edges: PersonEdge[]): PersonEdge[] {
  const seen = new Set<string>();
  const byPair = new Map<string, PersonEdge>();

  for (const e of edges) {
    if (e.confidence < MIN_CONFIDENCE) continue;
    const key = [e.sourcePersonId, e.targetPersonId].sort().join('|');
    const existing = byPair.get(key);
    if (!existing || e.confidence > existing.confidence) {
      byPair.set(key, e);
    }
  }

  return Array.from(byPair.values());
}

export function deduplicateEdges(edges: PersonEdge[]): PersonEdge[] {
  const seen = new Set<string>();
  const out: PersonEdge[] = [];
  for (const e of edges) {
    const key = `${e.sourcePersonId}|${e.targetPersonId}|${e.relationType}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

export function mergeEdges(a: PersonEdge[], b: PersonEdge[]): PersonEdge[] {
  const merged = [...a, ...b];
  return deduplicateEdges(normalizeEdges(merged));
}

export function getTopNeighbors(
  edges: PersonEdge[],
  sourceId: string,
  limit = TOP_NEIGHBORS
): PersonEdge[] {
  const outgoing = edges.filter((e) => e.sourcePersonId === sourceId);
  return outgoing
    .sort((x, y) => y.confidence - x.confidence)
    .slice(0, limit);
}
