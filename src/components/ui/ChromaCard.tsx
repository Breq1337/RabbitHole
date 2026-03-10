'use client';

import { useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { ChromaGridItem } from '@/types/chroma';

interface ChromaCardProps {
  item: ChromaGridItem;
  index: number;
  variant: string;
  onItemClick?: (item: ChromaGridItem) => void;
}

export function ChromaCard({ item, index, variant, onItemClick }: ChromaCardProps) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--spot-x', `${x}%`);
      el.style.setProperty('--spot-y', `${y}%`);
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    ref.current?.style.removeProperty('--spot-x');
    ref.current?.style.removeProperty('--spot-y');
  }, []);

  const href = item.href ?? (item.entityId ? `/explore?id=${item.entityId}` : undefined);
  const isLink = Boolean(href);

  const motionProps = {
    initial: { opacity: 0, y: 16 } as const,
    animate: { opacity: 1, y: 0 } as const,
    transition: { duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] as const },
    whileHover: { y: -4, scale: 1.02 } as const,
    whileTap: { scale: isPressed ? 0.98 : 1 } as const,
    style: { boxShadow: '0 4px 24px rgba(0,0,0,0.2)' } as React.CSSProperties,
  };

  const content = (
    <>
      {/* Chromatic glow layer */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(139,92,246,0.08))',
          filter: 'blur(1px)',
        }}
        aria-hidden
      />
      {/* Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(34,211,238,0.08), transparent 60%)',
        }}
        aria-hidden
      />
      {/* Portrait container */}
      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[var(--card-bg)] ring-1 ring-[var(--border)] group-hover:ring-[var(--accent)]/40 transition-all duration-300">
        {item.image ? (
          <Image
            src={item.image}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, 180px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl text-[var(--muted-foreground)]/60 bg-[var(--card-bg)]">
            ?
          </div>
        )}
      </div>
      {/* Gradient overlay for readability */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
      {/* Label — always visible */}
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="font-semibold text-white text-sm truncate drop-shadow-md">{item.name}</p>
        {(item.description || item.relationHint) && (
          <p className="text-xs text-white/90 truncate mt-0.5 drop-shadow-sm opacity-90 group-hover:opacity-100 transition-opacity">
            {item.relationHint ?? item.description}
          </p>
        )}
      </div>
      {/* Badge */}
      {item.badge && (
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--accent)]/20 text-[var(--accent)] ring-1 ring-[var(--accent)]/30">
          {item.badge}
        </span>
      )}
    </>
  );

  const interactionProps = {
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    onFocus: () => {},
    onBlur: handleMouseLeave,
    onPointerDown: () => setIsPressed(true),
    onPointerUp: () => setIsPressed(false),
    onPointerCancel: () => setIsPressed(false),
    className:
      'group relative block w-full text-left rounded-2xl p-2 chroma-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] chroma-glow-hover',
  };

  if (isLink) {
    return (
      <motion.a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        {...motionProps}
        {...interactionProps}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type="button"
      onClick={() => onItemClick?.(item)}
      {...motionProps}
      {...interactionProps}
    >
      {content}
    </motion.button>
  );
}
