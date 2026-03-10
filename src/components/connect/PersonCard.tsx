'use client';

import type { Person } from '@/types/connect';
import { motion } from 'framer-motion';

interface PersonCardProps {
  person: Person;
  index?: number;
}

export function PersonCard({ person, index = 0 }: PersonCardProps) {
  return (
    <motion.a
      href={person.wikipediaUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex flex-col items-center p-4 rounded-xl bg-[var(--card-bg)]/80 border border-[var(--border)] hover:border-[var(--accent)]/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.12)] transition-all group"
    >
      {person.image ? (
        <img
          src={person.image}
          alt={person.canonicalName}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[var(--border)] group-hover:border-[var(--accent)]/50 transition-colors"
        />
      ) : (
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[var(--muted)]/50 flex items-center justify-center text-2xl text-[var(--muted-foreground)] border-2 border-[var(--border)]">
          ?
        </div>
      )}
      <p className="mt-2 font-semibold text-[var(--foreground)] text-center">
        {person.canonicalName}
      </p>
      {person.shortDescription && (
        <p className="text-xs text-[var(--muted-foreground)] text-center line-clamp-2 mt-0.5 max-w-[180px]">
          {person.shortDescription}
        </p>
      )}
    </motion.a>
  );
}
