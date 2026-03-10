'use client';

import { motion } from 'framer-motion';

interface RelationLabelProps {
  label: string;
  index?: number;
}

export function RelationLabel({ label, index = 0 }: RelationLabelProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 + 0.1, duration: 0.25 }}
      className="flex items-center justify-center px-3 py-1.5 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] text-sm font-medium border border-[var(--accent)]/30"
    >
      {label}
    </motion.div>
  );
}
