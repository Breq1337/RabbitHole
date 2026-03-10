'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/contexts/LanguageContext';

interface TrendingItem {
  name: string;
  searchCount: number;
  entityId?: string;
}

export function TrendingSection() {
  const [trending, setTrending] = useState<TrendingItem[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    fetch('/api/trending')
      .then((r) => r.json())
      .then((d) => setTrending(d.trending || []))
      .catch(() => setTrending([]));
  }, []);

  if (trending.length === 0) return null;

  return (
    <section className="w-full max-w-2xl mx-auto mt-10">
      <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="text-[var(--accent)]">🔥</span> {t('trendingTitle')}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {trending.map((item, i) => (
          <motion.li
            key={item.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={item.entityId ? `/explore?id=${item.entityId}` : `/explore?q=${encodeURIComponent(item.name)}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent-dim)] transition-colors"
            >
              <span className="text-[var(--muted)] text-sm font-mono">{i + 1}</span>
              <span>{item.name}</span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
