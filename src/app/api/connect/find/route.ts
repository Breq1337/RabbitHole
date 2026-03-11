/**
 * Unified find: resolve A and B (by query or id) + path search in one response.
 * POST body:
 *   { personAQuery: string, personBQuery: string } OR
 *   { personAId: string, personBId: string }
 * Response: { path?: ConnectionPath, error?: string, personA?: Person, personB?: Person }
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolvePersonCandidates, hydrateResolvedPeople } from '@/services/connect/personResolver';
import { findConnectionPath } from '@/services/connect/pathSearch';
import type { Person } from '@/types/connect';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let personAId: string;
    let personBId: string;
    let personA: Person | undefined;
    let personB: Person | undefined;

    if (
      typeof body?.personAQuery === 'string' &&
      typeof body?.personBQuery === 'string'
    ) {
      const qA = body.personAQuery.trim();
      const qB = body.personBQuery.trim();
      if (!qA || !qB) {
        return NextResponse.json(
          { error: 'personAQuery and personBQuery are required' },
          { status: 400 }
        );
      }
      const [candidatesA, candidatesB] = await Promise.all([
        resolvePersonCandidates(qA, 3),
        resolvePersonCandidates(qB, 3),
      ]);
      const idA = candidatesA[0]?.id;
      const idB = candidatesB[0]?.id;
      if (!idA || !idB) {
        return NextResponse.json({
          error: 'Could not resolve one or both people.',
          personA: null,
          personB: null,
        });
      }
      personAId = idA;
      personBId = idB;
      const peopleMap = await hydrateResolvedPeople([idA, idB]);
      personA = peopleMap.get(idA) ?? undefined;
      personB = peopleMap.get(idB) ?? undefined;
    } else if (
      typeof body?.personAId === 'string' &&
      typeof body?.personBId === 'string'
    ) {
      personAId = body.personAId.trim();
      personBId = body.personBId.trim();
      if (!personAId || !personBId) {
        return NextResponse.json(
          { error: 'personAId and personBId are required' },
          { status: 400 }
        );
      }
      const peopleMap = await hydrateResolvedPeople([personAId, personBId]);
      personA = peopleMap.get(personAId) ?? undefined;
      personB = peopleMap.get(personBId) ?? undefined;
    } else {
      return NextResponse.json(
        {
          error:
            'Provide either { personAQuery, personBQuery } or { personAId, personBId }',
        },
        { status: 400 }
      );
    }

    const result = await findConnectionPath(personAId, personBId);

    if ('error' in result) {
      return NextResponse.json({
        error: result.error,
        personA: personA ?? null,
        personB: personB ?? null,
      });
    }

    return NextResponse.json({
      path: result,
      personA: personA ?? null,
      personB: personB ?? null,
    });
  } catch (e) {
    console.error('[Connect find]', e);
    return NextResponse.json({ error: 'Find failed' }, { status: 500 });
  }
}
