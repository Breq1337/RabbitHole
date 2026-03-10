'use client';

import Link from 'next/link';
import type { Entity } from '@/types';
import Image from 'next/image';
import { useTranslation } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

interface EntityDetailsProps {
  entity: Entity | null;
}

export function EntityDetails({ entity }: EntityDetailsProps) {
  const { t } = useTranslation();
  if (!entity) {
    return (
      <div className="p-4 text-[var(--muted-foreground)] text-sm rounded-xl border border-[var(--border)] bg-[var(--card-bg)]/80 backdrop-blur-sm">
        {t('clickNodeOrCard')}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)]/90 overflow-hidden backdrop-blur-sm shadow-[0_0_0_1px_rgba(34,211,238,0.05)]"
    >
      {entity.image && (
        <div className="relative w-full aspect-video bg-[var(--border)] rounded-t-xl overflow-hidden flex items-center justify-center min-h-[200px]">
          <Image
            src={entity.image}
            alt={entity.name}
            fill
            className="object-contain object-center"
            sizes="(max-width: 400px) 100vw, 320px"
            unoptimized
          />
        </div>
      )}
      <div className="p-4">
        <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider">
          {entity.type}
        </span>
        <h2 className="text-xl font-semibold text-[var(--foreground)] mt-1">{entity.name}</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-2 line-clamp-5">
          {entity.summary || entity.description || t('noDescription')}
        </p>
        {entity.interestingFact && (
          <p className="text-xs text-[var(--accent)]/95 mt-3 italic border-l-2 border-[var(--accent)]/50 pl-3">
            {entity.interestingFact}
          </p>
        )}
        {entity.wikipediaUrl && (
          <a
            href={entity.wikipediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-4 text-sm text-[var(--accent)] hover:underline font-medium"
          >
            {t('readOnWikipedia')}
          </a>
        )}
        <Link
          href={`/entity/${entity.id}`}
          className="block mt-3 text-sm text-[var(--muted-foreground)] hover:text-[var(--accent)] font-medium"
        >
          {t('fullEntityPage')}
        </Link>
      </div>
    </motion.div>
  );
}
