'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { ConnectionPath } from '@/types/connect';
import { useTranslation } from '@/contexts/LanguageContext';

interface ConnectionPathGraphProps {
  path: ConnectionPath;
  onPersonClick?: (index: number) => void;
}

const NODE_SIZE = 64;
const EDGE_HEIGHT = 40;

export function ConnectionPathGraph({ path, onPersonClick }: ConnectionPathGraphProps) {
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full overflow-x-auto overflow-y-visible py-6"
    >
      <div className="flex items-center justify-center gap-2 sm:gap-4 min-w-max px-4" style={{ minHeight: NODE_SIZE + EDGE_HEIGHT * 2 + 48 }}>
        {path.persons.map((person, i) => (
          <div key={person.id} className="flex items-center">
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.12, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onPersonClick?.(i)}
              className="group relative flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded-2xl"
            >
              {/* Glow */}
              <motion.div
                className="absolute inset-0 rounded-2xl -z-10"
                animate={{
                  boxShadow: hoveredIndex === i
                    ? '0 0 32px rgba(34,211,238,0.35), 0 0 0 1px rgba(34,211,238,0.3)'
                    : '0 0 20px rgba(34,211,238,0.12), 0 0 0 1px rgba(34,211,238,0.08)',
                }}
                transition={{ duration: 0.25 }}
              />
              {/* Portrait */}
              <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full overflow-hidden ring-2 ring-[var(--border)] group-hover:ring-[var(--accent)]/60 transition-all duration-300 bg-[var(--card-bg)]">
                {person.image ? (
                  <Image
                    src={person.image}
                    alt={person.canonicalName}
                    fill
                    sizes="72px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-2xl text-[var(--muted-foreground)]">
                    ?
                  </div>
                )}
              </div>
              {/* Name */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.12 + 0.15 }}
                className="mt-2 text-xs sm:text-sm font-medium text-[var(--foreground)] text-center max-w-[100px] truncate"
              >
                {person.canonicalName}
              </motion.p>
            </motion.button>

            {/* Edge + relation label */}
            {i < path.edges.length && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                transition={{ delay: i * 0.12 + 0.2, duration: 0.35 }}
                className="flex flex-col items-center justify-center px-2 sm:px-4 flex-shrink-0"
              >
                <div className="w-8 sm:w-12 h-px bg-gradient-to-r from-[var(--border)] via-[var(--accent)]/50 to-[var(--border)]" />
                <span className="text-[10px] sm:text-xs text-[var(--accent)] font-medium mt-1 px-2 py-0.5 rounded-full bg-[var(--accent)]/10 max-w-[80px] truncate">
                  {path.edges[i]!.label}
                </span>
                <div className="w-8 sm:w-12 h-px bg-gradient-to-r from-[var(--border)] via-[var(--accent)]/50 to-[var(--border)] mt-1" />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
