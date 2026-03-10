import { NextRequest, NextResponse } from 'next/server';
import { searchWikidata } from '@/lib/wikidata';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  if (!q || q.length < 2) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }
  try {
    const results = await searchWikidata(q, 10);
    return NextResponse.json({ results });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
