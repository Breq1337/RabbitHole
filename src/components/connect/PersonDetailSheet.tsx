'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Person, ConnectionPath } from '@/types/connect';
import { useTranslation } from '@/contexts/LanguageContext';

export interface PathContext {
  path: ConnectionPath;
  selectedIndex: number;
  prevPerson: Person | null;
  nextPerson: Person | null;
  edgeFromLabel?: string;
  edgeToLabel?: string;
}

interface PersonDetailSheetProps {
  person: Person | null;
  relationLabel?: string;
  pathContext?: PathContext | null;
  onClose: () => void;
  onSetAsStart?: () => void;
  onSetAsTarget?: () => void;
}

export function PersonDetailSheet({
  person,
  relationLabel,
  pathContext,
  onClose,
  onSetAsStart,
  onSetAsTarget,
}: PersonDetailSheetProps) {
  const { t } = useTranslation();
  if (!person) return null;

  const prevName = pathContext?.prevPerson?.canonicalName ?? '?';
  const nextName = pathContext?.nextPerson?.canonicalName ?? '?';
  const fromLabel = pathContext?.edgeFromLabel ?? relationLabel ?? '—';
  const toLabel = pathContext?.edgeToLabel ?? '—';
  const showWhyInPath = pathContext && (pathContext.prevPerson || pathContext.nextPerson);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-0 left-0 right-0 z-[51] sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:max-w-md sm:rounded-t-2xl sm:rounded-b-none bg-[var(--card-bg)] border border-[var(--border)] border-b-0 overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
      >
        <div className="flex-shrink-0 p-4 border-b border-[var(--border)]">
          <div className="w-8 h-1 rounded-full bg-[var(--muted)]/50 mx-auto" aria-hidden />
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-start gap-4">
            {person.image ? (
              <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[var(--accent)]/30">
                <Image
                  src={person.image}
                  alt={person.canonicalName}
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-[var(--muted)]/50 flex items-center justify-center text-2xl text-[var(--muted-foreground)] flex-shrink-0">
                ?
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-[var(--foreground)]">
                {person.canonicalName}
              </h3>
              {relationLabel && !showWhyInPath && (
                <p className="text-sm text-[var(--accent)] mt-1">{relationLabel}</p>
              )}
              {person.shortDescription && (
                <p className="text-sm text-[var(--muted-foreground)] mt-2 line-clamp-3">
                  {person.shortDescription}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/30 transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {showWhyInPath && (
            <div className="mt-4 p-3 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
              <p className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider mb-1.5">
                {t('whyInPath')}
              </p>
              <p className="text-sm text-[var(--foreground)]">
                <span className="text-[var(--muted-foreground)]">{prevName}</span>
                <span className="mx-1.5 text-[var(--accent)]">— {fromLabel} →</span>{' '}
                <span className="font-medium">{person.canonicalName}</span>
                {pathContext?.nextPerson && (
                  <>
                    <span className="mx-1.5 text-[var(--accent)]">— {toLabel} →</span>{' '}
                    <span className="text-[var(--muted-foreground)]">{nextName}</span>
                  </>
                )}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            <a
              href={`/explore?id=${person.id}`}
              className="text-sm px-3 py-2 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)]/25 transition-colors font-medium"
            >
              {t('exploreFromHere')}
            </a>
            {person.wikipediaUrl && (
              <a
                href={person.wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-3 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/50 transition-colors"
              >
                {t('readOnWikipedia')}
              </a>
            )}
            {onSetAsStart && (
              <button
                type="button"
                onClick={onSetAsStart}
                className="text-sm px-3 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/50 transition-colors"
              >
                {t('setAsStart')}
              </button>
            )}
            {onSetAsTarget && (
              <button
                type="button"
                onClick={onSetAsTarget}
                className="text-sm px-3 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]/50 transition-colors"
              >
                {t('setAsTarget')}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
