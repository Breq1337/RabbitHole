// Path ranking (labels kept from infobox/Wikidata)

import type { ConnectionPath, PersonEdge } from '@/types/connect';

const LENGTH_WEIGHT = 0.15;
const CONFIDENCE_WEIGHT = 0.4;

export async function rankPaths(
  candidates: Array<{ persons: { length: number }; edges: { fromIndex: number; toIndex: number; label: string; relationType: string }[]; raw?: PersonEdge[] }>
): Promise<ConnectionPath[]> {
  const scored: Array<{ path: ConnectionPath; score: number }> = [];

  for (const c of candidates) {
    const length = c.persons.length - 1;
    if (length > 6) continue;

    let score = (7 - length) * LENGTH_WEIGHT;
    const edges = c.raw ?? c.edges;
    for (const e of edges) {
      const conf = 'confidence' in e ? (e as PersonEdge).confidence : 0.7;
      score += conf * CONFIDENCE_WEIGHT;
    }
    score = Math.min(1, Math.max(0, score / (1 + length * 0.1)));

    const path: ConnectionPath = {
      persons: c.persons as ConnectionPath['persons'],
      edges: c.edges,
      score,
      length,
    };
    scored.push({ path, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.path);
}
