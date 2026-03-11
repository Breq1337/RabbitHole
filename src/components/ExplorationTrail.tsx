'use client';

import Link from 'next/link';
import type { ExplorationStep } from '@/types';
import { useTranslation } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

interface ExplorationTrailProps {
  steps: ExplorationStep[];
  buildSharePath: () => string;
}

export function ExplorationTrail({ steps, buildSharePath }: ExplorationTrailProps) {
  const { t } = useTranslation();
  if (steps.length === 0) return null;

  const sharePath = buildSharePath();

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-[var(--card-bg)]/90 border border-[var(--border)] backdrop-blur-sm shadow-[0_0_0_1px_rgba(34,211,238,0.05)]"
    >
      <span className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider font-medium">
        {t('trail')}
      </span>
      <div className="flex flex-wrap items-center gap-1">
        {steps.map((step, i) => (
          <span key={step.entityId + step.timestamp} className="flex items-center gap-1">
            <Link
              href={`/explore?id=${encodeURIComponent(step.entityId)}`}
              className="text-sm text-[var(--accent)] hover:text-[var(--accent)] hover:underline transition-colors duration-200"
            >
              {step.entityName}
            </Link>
            {i < steps.length - 1 && <span className="text-[var(--muted)]">→</span>}
          </span>
        ))}
      </div>
      {sharePath && (
        <Link
          href={sharePath}
          className="ml-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--accent)] font-medium"
          title={t('shareTrail')}
        >
          {t('share')}
        </Link>
      )}
    </motion.div>
  );
}
