'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { ConnectionPath } from '@/types/connect';
import { PersonDetailSheet } from './PersonDetailSheet';
import { ConnectionPathGraph } from './ConnectionPathGraph';
import { motion } from 'framer-motion';
import { useTranslation } from '@/contexts/LanguageContext';

function personToSlug(name: string): string {
  return encodeURIComponent(
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  );
}

interface ConnectionResultProps {
  path: ConnectionPath;
}

export function ConnectionResult({ path }: ConnectionResultProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedPerson = selectedIndex != null ? path.persons[selectedIndex] ?? null : null;
  const relationLabel = selectedIndex != null && path.edges[selectedIndex] ? path.edges[selectedIndex]!.label : undefined;

  const shareUrl =
    path.persons.length >= 2
      ? `${typeof window !== 'undefined' ? window.location.origin : ''}/connect/${personToSlug(path.persons[0].canonicalName)}/${personToSlug(path.persons[path.persons.length - 1].canonicalName)}`
      : '';

  const handleShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-8 p-6 rounded-2xl bg-[var(--card-bg)]/60 border border-[var(--border)]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--muted-foreground)]">
          {t('connectionLength')}:
        </span>
        <span className="font-semibold text-[var(--accent)]">{path.length}</span>
        </div>
        {shareUrl && (
          <button
            type="button"
            onClick={handleShare}
            className="text-sm px-3 py-1.5 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)]/25 transition-colors"
          >
            {copied ? '✓ ' : ''}{t('share')}
          </button>
        )}
      </div>
      <div className="relative">
        <ConnectionPathGraph path={path} onPersonClick={(i) => setSelectedIndex(i)} />
        <AnimatePresence>
          {selectedPerson && (
          <PersonDetailSheet
            key="detail"
            person={selectedPerson}
            relationLabel={relationLabel}
            onClose={() => setSelectedIndex(null)}
          />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
