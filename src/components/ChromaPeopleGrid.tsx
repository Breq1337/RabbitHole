'use client';

import { motion } from 'framer-motion';
import { ChromaCard } from '@/components/ui/ChromaCard';
import type { ChromaGridItem, ChromaGridVariant } from '@/types/chroma';
import { useTranslation } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/lib/translations';

interface ChromaPeopleGridProps {
  items: ChromaGridItem[];
  variant: ChromaGridVariant;
  title?: string;
  subtitle?: string;
  onItemClick?: (item: ChromaGridItem) => void;
  maxItems?: number;
}

const VARIANT_TITLES: Record<ChromaGridVariant, { title: TranslationKey; subtitle?: TranslationKey }> = {
  trending: { title: 'chromaTrendingTitle', subtitle: 'chromaTrendingSubtitle' },
  related: { title: 'chromaRelatedTitle', subtitle: 'chromaRelatedSubtitle' },
  continueExploring: { title: 'chromaContinueTitle', subtitle: 'chromaContinueSubtitle' },
  savedTrails: { title: 'chromaSavedTitle', subtitle: 'chromaSavedSubtitle' },
  popularConnections: { title: 'chromaPopularTitle', subtitle: 'chromaPopularSubtitle' },
};

const VARIANT_CONFIG: Record<
  ChromaGridVariant,
  { cols: string; gap: string; cardSize: string; badgeKey?: string }
> = {
  trending: { cols: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4', gap: 'gap-3 sm:gap-4', cardSize: 'max-w-[180px]', badgeKey: 'trendingBadge' },
  related: { cols: 'grid-cols-2 sm:grid-cols-3', gap: 'gap-3', cardSize: 'max-w-[160px]', badgeKey: 'relatedBadge' },
  continueExploring: { cols: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4', gap: 'gap-3 sm:gap-4', cardSize: 'max-w-[160px]', badgeKey: 'continueBadge' },
  savedTrails: { cols: 'grid-cols-2 sm:grid-cols-3', gap: 'gap-3', cardSize: 'max-w-[140px]', badgeKey: 'savedBadge' },
  popularConnections: { cols: 'grid-cols-2 sm:grid-cols-3', gap: 'gap-3', cardSize: 'max-w-[160px]', badgeKey: 'popularBadge' },
};

export function ChromaPeopleGrid({
  items,
  variant,
  title,
  subtitle,
  onItemClick,
  maxItems = 12,
}: ChromaPeopleGridProps) {
  const { t } = useTranslation();
  const config = VARIANT_CONFIG[variant];
  const displayItems = items.slice(0, maxItems);

  if (displayItems.length === 0) return null;

  const defaults = VARIANT_TITLES[variant];
  const sectionTitle = title ?? t(defaults.title);
  const sectionSubtitle = subtitle ?? (defaults.subtitle ? t(defaults.subtitle) : undefined);

  return (
    <section className="w-full max-w-4xl mx-auto">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4"
      >
        <h2 className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-2">
          <span className="text-[var(--accent)]">✦</span>
          {sectionTitle}
        </h2>
        {sectionSubtitle && (
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{sectionSubtitle}</p>
        )}
      </motion.header>
      <div
        className={`grid ${config.cols} ${config.gap} justify-items-center`}
        role="list"
        aria-label={sectionTitle}
      >
        {displayItems.map((item, i) => (
          <div key={item.id} className={`w-full ${config.cardSize}`} role="listitem">
            <ChromaCard
              item={{
                ...item,
                href: item.href ?? (item.entityId ? `/explore?id=${item.entityId}` : undefined),
              }}
              index={i}
              variant={variant}
              onItemClick={onItemClick}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
