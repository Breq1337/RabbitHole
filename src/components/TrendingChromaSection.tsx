'use client';

import { useEffect, useState } from 'react';
import { ChromaPeopleGrid } from '@/components/ChromaPeopleGrid';
import type { ChromaGridItem } from '@/types/chroma';

export function TrendingChromaSection() {
  const [items, setItems] = useState<ChromaGridItem[]>([]);

  useEffect(() => {
    fetch('/api/trending/people')
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  return (
    <ChromaPeopleGrid
      items={items}
      variant="trending"
      maxItems={6}
    />
  );
}
