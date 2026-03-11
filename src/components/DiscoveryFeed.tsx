'use client';

import { motion } from 'framer-motion';
import type { DiscoveryCard } from '@/types';
import { useTranslation } from '@/contexts/LanguageContext';
import { DiscoveryCard as DiscoveryCardComponent } from './DiscoveryCard';

interface DiscoveryFeedProps {
  feed: DiscoveryCard[];
  onSelect: (card: DiscoveryCard) => void;
  selectedId?: string | null;
}

export function DiscoveryFeed({ feed, onSelect, selectedId }: DiscoveryFeedProps) {
  const { t } = useTranslation();
  if (feed.length === 0) {
    return (
      <div className="text-[var(--muted-foreground)] text-sm p-4 rounded-xl border border-[var(--border)] bg-[var(--card-bg)]/50">
        {t('noDiscoveriesYet')}
      </div>
    );
  }

  return (
    <div className="space-y-3 overflow-y-auto max-h-[420px] pr-2">
      {feed.map((card, i) => (
        <DiscoveryCardComponent
          key={card.id}
          card={card}
          isSelected={selectedId === card.id}
          index={i}
          onSelect={() => onSelect(card)}
        />
      ))}
    </div>
  );
}
