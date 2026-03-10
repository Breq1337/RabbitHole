'use client';

import { motion } from 'framer-motion';
import type { DiscoveryCard } from '@/types';
import Image from 'next/image';

interface DiscoveryFeedProps {
  feed: DiscoveryCard[];
  onSelect: (card: DiscoveryCard) => void;
  selectedId?: string | null;
}

export function DiscoveryFeed({ feed, onSelect, selectedId }: DiscoveryFeedProps) {
  if (feed.length === 0) {
    return (
      <div className="text-[var(--muted)] text-sm p-4">No discoveries yet. Search to start.</div>
    );
  }

  return (
    <div className="space-y-3 overflow-y-auto max-h-[420px] pr-2">
      {feed.map((card, i) => (
        <motion.button
          key={card.id}
          type="button"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onSelect(card)}
          className={`w-full text-left rounded-xl border p-3 transition-all ${
            selectedId === card.id
              ? 'border-[var(--accent)] bg-[var(--accent-dim)]'
              : 'border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--muted)]'
          }`}
        >
          <div className="flex gap-3">
            {card.image ? (
              <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--border)]">
                <Image
                  src={card.image}
                  alt=""
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-lg bg-[var(--border)] flex-shrink-0 flex items-center justify-center text-[var(--muted)] text-xl">
                •
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-[var(--foreground)] truncate">{card.title}</h4>
              <p className="text-xs text-[var(--muted)] line-clamp-2 mt-0.5">{card.summary}</p>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
