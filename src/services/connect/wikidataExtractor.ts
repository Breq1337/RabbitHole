// Wikidata person claims -> PersonEdge[]

import type { PersonEdge } from '@/types/connect';
import { wikidataFetch } from '@/lib/wikidata';

const WD_API = 'https://www.wikidata.org/w/api.php';

const PERSON_CLAIMS: Record<string, { type: string; label: string }> = {
  P26: { type: 'MARRIED_TO', label: 'married to' },
  P451: { type: 'DATED', label: 'partner of' },
  P40: { type: 'FAMILY_OF', label: 'child of' },
  P22: { type: 'FAMILY_OF', label: 'father' },
  P25: { type: 'FAMILY_OF', label: 'mother' },
  P184: { type: 'MENTORED_BY', label: 'mentored by' },
  P185: { type: 'MENTORED_BY', label: 'doctoral student of' },
  P286: { type: 'COACHED_BY', label: 'coached by' },
  P1412: { type: 'COACHED_BY', label: 'languages spoken' },
};

async function getEntityClaims(wikidataId: string): Promise<Record<string, { id: string }[]>> {
  try {
    const res = await wikidataFetch(
      `${WD_API}?action=wbgetentities&ids=${wikidataId}&props=claims&format=json&origin=*`
    );
    const text = await res.text();
    if (!res.headers.get('content-type')?.includes('application/json')) return {};
    const data = JSON.parse(text) as { entities?: Record<string, { claims?: Record<string, unknown[]> }> };
    const entity = data.entities?.[wikidataId];
    if (!entity?.claims) return {};

    type ClaimItem = { mainsnak?: { datavalue?: { value?: { id?: string } } } };
    const out: Record<string, { id: string }[]> = {};
    for (const [prop, list] of Object.entries(entity.claims)) {
      if (!Array.isArray(list)) continue;
      const ids = (list as ClaimItem[])
        .map((c) => c.mainsnak?.datavalue?.value?.id)
        .filter((id): id is string => typeof id === 'string');
      if (ids.length > 0) out[prop] = ids.map((id) => ({ id }));
    }
    return out;
  } catch {
    return {};
  }
}

const BATCH_SIZE = 50;

function isHumanFromEntity(claims: Record<string, unknown> | undefined): boolean {
  const p31 = claims?.P31;
  if (!Array.isArray(p31)) return false;
  type ClaimItem = { mainsnak?: { datavalue?: { value?: { id?: string } } } };
  const instanceIds = (p31 as ClaimItem[])
    .map((c) => c.mainsnak?.datavalue?.value?.id)
    .filter((id): id is string => Boolean(id));
  return instanceIds.includes('Q5');
}

async function batchIsHuman(qids: string[]): Promise<Set<string>> {
  const humans = new Set<string>();
  if (qids.length === 0) return humans;
  for (let i = 0; i < qids.length; i += BATCH_SIZE) {
    const batch = qids.slice(i, i + BATCH_SIZE);
    const idsParam = batch.join('|');
    try {
      const res = await wikidataFetch(
        `${WD_API}?action=wbgetentities&ids=${idsParam}&props=claims&format=json&origin=*`
      );
      const text = await res.text();
      if (!res.headers.get('content-type')?.includes('application/json')) continue;
      const data = JSON.parse(text) as {
        entities?: Record<string, { claims?: Record<string, unknown> }>;
      };
      const entities = data.entities ?? {};
      for (const qid of batch) {
        if (isHumanFromEntity(entities[qid]?.claims)) humans.add(qid);
      }
    } catch {
      // skip batch on error
    }
  }
  return humans;
}

export async function extractWikidataEdges(wikidataId: string): Promise<PersonEdge[]> {
  const claims = await getEntityClaims(wikidataId);
  const allTargetIds: string[] = [];

  for (const [prop] of Object.entries(PERSON_CLAIMS)) {
    const values = claims[prop];
    if (!values) continue;
    for (const { id } of values.slice(0, 5)) {
      if (id !== wikidataId) allTargetIds.push(id);
    }
  }
  const humans = await batchIsHuman([...new Set(allTargetIds)]);

  const edges: PersonEdge[] = [];
  for (const [prop, mapping] of Object.entries(PERSON_CLAIMS)) {
    const values = claims[prop];
    if (!values) continue;
    for (const { id } of values.slice(0, 5)) {
      if (humans.has(id) && id !== wikidataId) {
        edges.push({
          sourcePersonId: wikidataId,
          targetPersonId: id,
          relationType: mapping.type as PersonEdge['relationType'],
          relationLabel: mapping.label,
          evidenceType: 'wikidata',
          confidence: 0.9,
        });
      }
    }
  }

  return edges;
}
