'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PersonSearchInput } from '@/components/connect/PersonSearchInput';
import { useTranslation } from '@/contexts/LanguageContext';
import type { Person } from '@/types/connect';

interface HeroDualSearchProps {
  onSearch: (personA: Person, personB: Person) => void;
  isLoading: boolean;
}

export function HeroDualSearch({ onSearch, isLoading }: HeroDualSearchProps) {
  const { t } = useTranslation();
  const [personA, setPersonA] = useState<Person | null>(null);
  const [personB, setPersonB] = useState<Person | null>(null);
  const [surpriseLoading, setSurpriseLoading] = useState(false);

  const handleSwap = () => {
    setPersonA(personB);
    setPersonB(personA);
  };

  const handleSurprisePair = async () => {
    setSurpriseLoading(true);
    try {
      const res = await fetch('/api/connect/surprise-pair');
      const data = await res.json();
      if (data.personA && data.personB) {
        setPersonA(data.personA);
        setPersonB(data.personB);
      }
    } catch {
      // fallback: keep current or leave empty
    } finally {
      setSurpriseLoading(false);
    }
  };

  const handleFindConnection = () => {
    if (personA && personB) onSearch(personA, personB);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-xl mx-auto space-y-6"
    >
      <div className="space-y-4">
        <PersonSearchInput
          value={personA}
          onChange={setPersonA}
          label={t('connectPersonA')}
          disabled={isLoading}
        />
        <div className="flex justify-center -my-2 relative z-10">
          <motion.button
            type="button"
            onClick={handleSwap}
            className="p-2 rounded-full bg-[var(--card-bg)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--accent)] hover:border-[var(--accent)]/50 transition-all"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            aria-label={t('swapPeople')}
          >
            <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </motion.button>
        </div>
        <PersonSearchInput
          value={personB}
          onChange={setPersonB}
          label={t('connectPersonB')}
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <motion.button
          type="button"
          onClick={handleFindConnection}
          disabled={!personA || !personB || isLoading}
          className="flex-1 py-3 px-6 rounded-xl bg-[var(--accent)]/25 text-[var(--accent)] font-semibold hover:bg-[var(--accent)]/35 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_24px_rgba(34,211,238,0.15)]"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? t('connecting') : t('findConnection')}
        </motion.button>
        <motion.button
          type="button"
          onClick={handleSurprisePair}
          disabled={surpriseLoading || isLoading}
          className="py-3 px-6 rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--muted)] hover:bg-[var(--card-bg)] transition-all disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {surpriseLoading ? '…' : `✨ ${t('surprisePair')}`}
        </motion.button>
      </div>
    </motion.div>
  );
}
