import { NextRequest, NextResponse } from 'next/server';
import { buildDiscoveryFromQuery, buildDiscoveryFromEntityId } from '@/lib/discovery';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  const id = request.nextUrl.searchParams.get('id');
  if (!q && !id) {
    return NextResponse.json({ error: 'Provide q or id' }, { status: 400 });
  }
  try {
    if (id) {
      const data = await buildDiscoveryFromEntityId(id, { limit: 12, includeUnexpected: true });
      return NextResponse.json(data);
    }
    const data = await buildDiscoveryFromQuery(q!, { limit: 12, includeUnexpected: true });
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Explore failed' }, { status: 500 });
  }
}
