// Bidirectional BFS path search

import type { Person, PersonEdge, ConnectionPath } from '@/types/connect';
import { getPrunedNeighbors } from './peopleGraph';
import { getPersonById } from './personResolver';
import { getFromCache, setCache } from '@/lib/cache';
import { rankPaths } from './pathRanking';

const MAX_DEPTH = 6;
const TIMEOUT_MS = 30000;
const PATH_CACHE_TTL = 86400;

interface BFSNode {
  id: string;
  depth: number;
  parentId: string | null;
  edge: PersonEdge | null;
}

export async function findConnectionPath(
  personAId: string,
  personBId: string
): Promise<ConnectionPath | { error: string }> {
  if (personAId === personBId) {
    const p = await getPersonById(personAId);
    if (!p) return { error: 'Person not found.' };
    return {
      persons: [p],
      edges: [],
      score: 1,
      length: 0,
    };
  }

  const cacheKey = `connect:path:${[personAId, personBId].sort().join(':')}`;
  const cached = getFromCache<ConnectionPath>(cacheKey);
  if (cached) return cached;

  const start = Date.now();
  const checkTimeout = () => {
    if (Date.now() - start > TIMEOUT_MS) throw new Error('timeout');
  };

  try {
    const queueA: BFSNode[] = [{ id: personAId, depth: 0, parentId: null, edge: null }];
    const queueB: BFSNode[] = [{ id: personBId, depth: 0, parentId: null, edge: null }];
    const visitedA = new Map<string, BFSNode>();
    const visitedB = new Map<string, BFSNode>();
    visitedA.set(personAId, queueA[0]);
    visitedB.set(personBId, queueB[0]);

    let result: { meetingNode: string; fromA: BFSNode; fromB: BFSNode } | null = null;

    while (queueA.length > 0 || queueB.length > 0) {
      checkTimeout();

      if (queueA.length > 0) {
        const node = queueA.shift()!;
        if (node.depth < MAX_DEPTH) {
          const neighbors = await getPrunedNeighbors(node.id);
          for (const edge of neighbors) {
            const nextId = edge.targetPersonId;
            if (visitedB.has(nextId)) {
              result = {
                meetingNode: nextId,
                fromA: { ...node, parentId: node.id, edge },
                fromB: visitedB.get(nextId)!,
              };
              break;
            }
            if (!visitedA.has(nextId)) {
              const next: BFSNode = { id: nextId, depth: node.depth + 1, parentId: node.id, edge };
              visitedA.set(nextId, next);
              queueA.push(next);
            }
          }
        }
        if (result) break;
      }

      if (result) break;

      if (queueB.length > 0) {
        const node = queueB.shift()!;
        if (node.depth < MAX_DEPTH) {
          const neighbors = await getPrunedNeighbors(node.id);
          for (const edge of neighbors) {
            const nextId = edge.targetPersonId;
            if (visitedA.has(nextId)) {
              result = {
                meetingNode: nextId,
                fromA: visitedA.get(nextId)!,
                fromB: { ...node, parentId: node.id, edge },
              };
              break;
            }
            if (!visitedB.has(nextId)) {
              const next: BFSNode = { id: nextId, depth: node.depth + 1, parentId: node.id, edge };
              visitedB.set(nextId, next);
              queueB.push(next);
            }
          }
        }
        if (result) break;
      }
    }

    if (!result) {
      return { error: 'No connection found within six degrees.' };
    }

    const path = await reconstructPath(personAId, personBId, result, visitedA, visitedB);
    setCache(cacheKey, path, PATH_CACHE_TTL);
    return path;
  } catch (e) {
    if ((e as Error).message === 'timeout') {
      return { error: 'Search timed out. Try people with more notable connections.' };
    }
    throw e;
  }
}

async function reconstructPath(
  personAId: string,
  personBId: string,
  result: { meetingNode: string; fromA: BFSNode; fromB: BFSNode },
  visitedA: Map<string, BFSNode>,
  visitedB: Map<string, BFSNode>
): Promise<ConnectionPath> {
  const meeting = result.meetingNode;
  const pathA: { id: string; edge: PersonEdge | null }[] = [];
  const pathB: { id: string; edge: PersonEdge | null }[] = [];

  const fromAIsParent = result.fromA.id !== meeting;
  if (fromAIsParent) {
    let cur: BFSNode | undefined = result.fromA;
    while (cur) {
      pathA.unshift({ id: cur.id, edge: cur.edge });
      cur = cur.parentId ? visitedA.get(cur.parentId) : undefined;
    }
    if (result.fromA.edge) pathA.push({ id: meeting, edge: result.fromA.edge });
    let curB = visitedB.get(meeting);
    while (curB?.parentId) {
      const next = visitedB.get(curB.parentId);
      const revEdge = curB.edge
        ? { ...curB.edge, sourcePersonId: curB.edge.targetPersonId, targetPersonId: curB.edge.sourcePersonId }
        : null;
      pathB.push({ id: next!.id, edge: revEdge });
      curB = next;
    }
  } else {
    let cur: BFSNode | undefined = result.fromA;
    while (cur) {
      pathA.unshift({ id: cur.id, edge: cur.edge });
      cur = cur.parentId ? visitedA.get(cur.parentId) : undefined;
    }
    let curB: BFSNode | undefined = result.fromB;
    while (curB) {
      const revEdge = curB.edge
        ? { ...curB.edge, sourcePersonId: curB.edge.targetPersonId, targetPersonId: curB.edge.sourcePersonId }
        : null;
      pathB.push({ id: curB.id, edge: revEdge });
      curB = curB.parentId ? visitedB.get(curB.parentId) : undefined;
    }
  }

  const ids = pathA.map((p) => p.id).concat(pathB.map((p) => p.id));
  const uniq = [...new Map(ids.map((id) => [id, id])).values()];
  const edgesRaw = pathA
    .filter((p) => p.edge)
    .map((p) => p.edge!)
    .concat(pathB.filter((p) => p.edge).map((p) => p.edge!));

  const personResults = await Promise.all(uniq.map((id) => getPersonById(id)));
  const persons = personResults.filter((p): p is Person => p != null);

  const edges = edgesRaw.slice(0, persons.length - 1).map((e, i) => ({
    fromIndex: i,
    toIndex: i + 1,
    label: e.relationLabel,
    relationType: e.relationType,
  }));

  const candidates = [{ persons, edges, raw: edgesRaw }];
  const ranked = await rankPaths(candidates);
  const best = ranked[0] ?? {
    persons,
    edges,
    score: 0.8,
    length: persons.length - 1,
  };

  return best;
}
