import { NextResponse } from 'next/server';
import { entityToEntity } from '@/lib/discovery';
import type { ChromaGridItem } from '@/types/chroma';

const MOCK_TRENDING = [
  { name: 'Elon Musk', searchCount: 1240, entityId: 'Q317521' },
  { name: 'Nikola Tesla', searchCount: 756, entityId: 'Q920' },
  { name: 'Albert Einstein', searchCount: 892, entityId: 'Q937' },
  { name: 'Steve Jobs', searchCount: 654, entityId: 'Q19837' },
  { name: 'Marie Curie', searchCount: 521, entityId: 'Q7186' },
];

export async function GET() {
  try {
    const enriched: ChromaGridItem[] = await Promise.all(
      MOCK_TRENDING.map(async (item) => {
        if (!item.entityId) {
          return {
            id: item.name,
            name: item.name,
            entityId: undefined,
            href: `/explore?q=${encodeURIComponent(item.name)}`,
            score: item.searchCount,
            badge: 'trending',
          } satisfies ChromaGridItem;
        }
        const entity = await entityToEntity(item.entityId);
        return {
          id: item.entityId,
          name: entity?.name ?? item.name,
          image: entity?.image,
          description: entity?.description ?? entity?.summary,
          entityId: item.entityId,
          href: `/explore?id=${item.entityId}`,
          score: item.searchCount,
          badge: 'trending',
        } satisfies ChromaGridItem;
      })
    );

    return NextResponse.json({ items: enriched });
  } catch (e) {
    console.error('[trending/people]', e);
    return NextResponse.json(
      { items: MOCK_TRENDING.map((t) => ({ id: t.entityId ?? t.name, name: t.name, href: t.entityId ? `/explore?id=${t.entityId}` : `/explore?q=${encodeURIComponent(t.name)}`, score: t.searchCount })) },
      { status: 200 }
    );
  }
}
