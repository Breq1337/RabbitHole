'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getEdgePath } from '@/lib/graphLayout';

export interface ConnectionGraphEdgeProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  revealDelay?: number;
}

export function ConnectionGraphEdge({
  x1,
  y1,
  x2,
  y2,
  label,
  revealDelay = 0,
}: ConnectionGraphEdgeProps) {
  const pathD = useMemo(() => getEdgePath(x1, y1, x2, y2), [x1, y1, x2, y2]);

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <g>
      <motion.path
        d={pathD}
        fill="none"
        stroke="rgba(34, 211, 238, 0.85)"
        strokeWidth={2.5}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          delay: revealDelay / 1000,
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{
          filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.3))',
        }}
      />
      {label && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: (revealDelay + 200) / 1000,
            duration: 0.2,
          }}
        >
          <text
            x={midX}
            y={midY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-[var(--accent)]"
            style={{
              fontSize: 'var(--graph-edge-label-size, 11px)',
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
            }}
          >
            {label.length > 18 ? label.slice(0, 16) + '…' : label}
          </text>
        </motion.g>
      )}
    </g>
  );
}
