import { NextRequest, NextResponse } from 'next/server';
import { resolvePerson } from '@/services/connect/personResolver';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = typeof body?.query === 'string' ? body.query.trim() : '';
    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be a non-empty string with at least 2 characters' },
        { status: 400 }
      );
    }
    const people = await resolvePerson(query);
    return NextResponse.json({ people });
  } catch (e) {
    console.error('[Connect resolve]', e);
    return NextResponse.json({ error: 'Resolve failed' }, { status: 500 });
  }
}
