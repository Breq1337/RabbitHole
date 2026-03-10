import { NextRequest, NextResponse } from 'next/server';
import { findConnectionPath } from '@/services/connect/pathSearch';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const personAId = typeof body?.personAId === 'string' ? body.personAId.trim() : '';
    const personBId = typeof body?.personBId === 'string' ? body.personBId.trim() : '';

    if (!personAId || !personBId) {
      return NextResponse.json(
        { error: 'personAId and personBId are required' },
        { status: 400 }
      );
    }

    const result = await findConnectionPath(personAId, personBId);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 200 });
    }

    return NextResponse.json({ path: result });
  } catch (e) {
    console.error('[Connect search]', e);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
