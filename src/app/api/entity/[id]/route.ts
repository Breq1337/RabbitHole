import { NextRequest, NextResponse } from 'next/server';
import { entityToEntity, enrichEntityWithWikipedia, buildDiscoveryFromEntityId } from '@/lib/discovery';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  try {
    const e = await entityToEntity(id);
    if (!e) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await enrichEntityWithWikipedia(e);
    const { feed } = await buildDiscoveryFromEntityId(id, { limit: 6 });
    const related = feed.slice(1, 7).map((c) => c.entity);
    return NextResponse.json({ entity: e, related });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
