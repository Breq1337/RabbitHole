'use client';

<<<<<<< HEAD
import { useRef, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import type { ConnectionPath } from '@/types/connect';
import { PersonDetailSheet } from './PersonDetailSheet';
import { ConnectionGraph } from './ConnectionGraph';
import { useGraphPanZoom } from '@/hooks/useGraphPanZoom';
import { useTranslation } from '@/contexts/LanguageContext';
import { Maximize2, Share2 } from 'lucide-react';
=======
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { ConnectionPath } from '@/types/connect';
import { PersonDetailSheet } from './PersonDetailSheet';
import { ConnectionPathGraph } from './ConnectionPathGraph';
import { motion } from 'framer-motion';
import { useTranslation } from '@/contexts/LanguageContext';
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f

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

<<<<<<< HEAD
export interface ConnectionResultProps {
  path?: ConnectionPath;
  isLoading?: boolean;
}

export function ConnectionResult({ path, isLoading = false }: ConnectionResultProps) {
  const { t } = useTranslation();
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const { transform, recenter, onWheel, onPointerDown, onPointerMove, onPointerUp } =
    useGraphPanZoom(graphContainerRef);

  useEffect(() => {
    if (path && path.persons.length > 0) recenter();
  }, [path, recenter]);

  const [copied, setCopied] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedPerson = path && selectedIndex != null ? path.persons[selectedIndex] ?? null : null;
  const relationLabel =
    path && selectedIndex != null && path.edges[selectedIndex]
      ? path.edges[selectedIndex]!.label
      : undefined;

  const shareUrl =
    path && path.persons.length >= 2
=======
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
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
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

<<<<<<< HEAD
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 p-6 rounded-2xl bg-[var(--card-bg)]/60 border border-[var(--border)]"
      >
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          <p className="text-[var(--muted-foreground)]">{t('connecting')}</p>
          <div className="flex gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]/60 animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]/60 animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]/60 animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </motion.div>
    );
  }

  if (!path || path.persons.length === 0) return null;

=======
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
<<<<<<< HEAD
      className="mt-8 rounded-2xl bg-[var(--card-bg)]/60 border border-[var(--border)] overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--muted-foreground)]">
            {t('connectionLength')}:
          </span>
          <span className="font-semibold text-[var(--accent)]">{path.length}</span>
          <button
            type="button"
            onClick={recenter}
            className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors"
            aria-label={t('recenter')}
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">{t('recenter')}</span>
          </button>
=======
      className="mt-8 p-6 rounded-2xl bg-[var(--card-bg)]/60 border border-[var(--border)]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--muted-foreground)]">
          {t('connectionLength')}:
        </span>
        <span className="font-semibold text-[var(--accent)]">{path.length}</span>
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
        </div>
        {shareUrl && (
          <button
            type="button"
            onClick={handleShare}
<<<<<<< HEAD
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] hover:bg-[var(--accent)]/25 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {copied ? (t('copied') ?? '✓') : t('share')}
          </button>
        )}
      </div>

      <div
        ref={graphContainerRef}
        className="relative touch-none h-[380px] w-full"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <ConnectionGraph
          path={path}
          selectedIndex={selectedIndex}
          onNodeClick={(i) => setSelectedIndex(i)}
          transform={transform}
          revealDelay={0}
        />
      </div>

      <AnimatePresence>
        {selectedPerson && (
=======
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
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
          <PersonDetailSheet
            key="detail"
            person={selectedPerson}
            relationLabel={relationLabel}
<<<<<<< HEAD
            pathContext={{
              path,
              selectedIndex: selectedIndex ?? 0,
              prevPerson: selectedIndex != null && selectedIndex > 0 ? path.persons[selectedIndex - 1] ?? null : null,
              nextPerson: selectedIndex != null && selectedIndex < path.persons.length - 1 ? path.persons[selectedIndex + 1] ?? null : null,
              edgeFromLabel: selectedIndex != null && selectedIndex > 0 ? path.edges[selectedIndex - 1]?.label : undefined,
              edgeToLabel: selectedIndex != null && selectedIndex < path.edges.length ? path.edges[selectedIndex]?.label : undefined,
            }}
            onClose={() => setSelectedIndex(null)}
          />
        )}
      </AnimatePresence>
=======
            onClose={() => setSelectedIndex(null)}
          />
          )}
        </AnimatePresence>
      </div>
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
    </motion.div>
  );
}
