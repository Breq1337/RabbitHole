'use client';

import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { DiscoveryCard as DiscoveryCardType } from '@/types';

interface DiscoveryCardProps {
  card: DiscoveryCardType;
  isSelected: boolean;
  index: number;
  onSelect: () => void;
}

export function DiscoveryCard({ card, isSelected, index, onSelect }: DiscoveryCardProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty('--spot-x', `${x}px`);
      el.style.setProperty('--spot-y', `${y}px`);
    },
    []
  );

  return (
    <motion.button
      ref={ref}
      type="button"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      onClick={onSelect}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        ref.current?.style.removeProperty('--spot-x');
        ref.current?.style.removeProperty('--spot-y');
      }}
      className={`card-spotlight w-full text-left rounded-xl border p-3 transition-all duration-300 ${
        isSelected
          ? 'border-[var(--accent)] bg-[var(--accent-dim)] shadow-[0_0_20px_rgba(34,211,238,0.12)]'
          : 'border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--accent)]/40 hover:bg-[var(--card-bg)]'
      }`}
    >
      <div className="flex gap-3">
        {card.image ? (
          <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--border)] flex items-center justify-center ring-1 ring-[var(--border)]">
            <Image
              src={card.image}
              alt=""
              width={56}
              height={56}
              className="object-contain w-full h-full"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-lg bg-[var(--border)]/80 flex-shrink-0 flex items-center justify-center text-[var(--muted-foreground)] text-xl">
            •
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-[var(--foreground)] truncate">{card.title}</h4>
          <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mt-0.5">{card.summary}</p>
        </div>
      </div>
    </motion.button>
  );
}
