/**
 * Lightweight autocomplete: resolve query to candidates (no heavy Wikipedia summary).
 * POST body: { query: string, limit?: number }
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolvePersonCandidates } from '@/services/connect/personResolver';
import { getWikipediaUrl } from '@/lib/mediawiki';
import type { Person } from '@/types/connect';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = typeof body?.query === 'string' ? body.query.trim() : '';
    const limit = typeof body?.limit === 'number' ? Math.min(10, Math.max(1, body.limit)) : 8;

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be a non-empty string with at least 2 characters' },
        { status: 400 }
      );
    }

    const candidates = await resolvePersonCandidates(query, limit);
    const people: Person[] = candidates.map((c) => ({
      id: c.id,
      canonicalName: c.canonicalName,
      wikipediaTitle: c.wikipediaTitle,
      wikipediaUrl: c.wikipediaTitle
        ? getWikipediaUrl(c.wikipediaTitle)
        : undefined,
      image: c.image,
      shortDescription: c.shortDescription,
    }));
    return NextResponse.json({ people });
  } catch (e) {
    console.error('[Connect autocomplete]', e);
    return NextResponse.json({ error: 'Autocomplete failed' }, { status: 500 });
  }
}
