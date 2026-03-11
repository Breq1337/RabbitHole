'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/contexts/LanguageContext';

export function RandomButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/random');
      const data = await res.json();
      const topic = data.topic || 'Albert Einstein';
      router.push(`/explore?q=${encodeURIComponent(topic)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--accent-dim)] border border-[var(--accent)]/40 text-[var(--accent)] hover:bg-[var(--accent)]/25 transition-colors disabled:opacity-70"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="text-xl">🎲</span>
      <span>{loading ? t('takingYou') : t('takeMeRandom')}</span>
    </motion.button>
  );
}
