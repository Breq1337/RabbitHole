'use client';

import { motion } from 'framer-motion';
import type { Person } from '@/types/connect';

export interface ConnectionGraphNodeProps {
  x: number;
  y: number;
  radius: number;
  person: Person;
  isSelected: boolean;
  onClick?: () => void;
  revealDelay?: number;
}

export function ConnectionGraphNode({
  x,
  y,
  radius,
  person,
  isSelected,
  onClick,
  revealDelay = 0,
}: ConnectionGraphNodeProps) {
  const clipId = `node-clip-${person.id}`;

  return (
    <motion.g
      transform={`translate(${x}, ${y})`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: revealDelay / 1000,
        duration: 0.4,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={person.canonicalName}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      <defs>
        <clipPath id={clipId}>
          <circle r={radius} cx={0} cy={0} />
        </clipPath>
      </defs>
      {/* Glow — uses CSS-like box-shadow via filter (drop-shadow on group doesn't blur fill, so use circle with soft fill) */}
      <motion.circle
        cx={0}
        cy={0}
        r={radius + 8}
        fill="rgba(34, 211, 238, 0.12)"
        animate={{
          fill: isSelected
            ? 'rgba(34, 211, 238, 0.25)'
            : 'rgba(34, 211, 238, 0.12)',
        }}
        transition={{ duration: 0.2 }}
      />
      {/* Portrait or placeholder bg */}
      {person.image ? (
        <g clipPath={`url(#${clipId})`}>
          <image
            href={person.image}
            x={-radius}
            y={-radius}
            width={radius * 2}
            height={radius * 2}
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
      ) : (
        <circle
          cx={0}
          cy={0}
          r={radius}
          fill="var(--card-bg)"
        />
      )}
      {/* Ring */}
      <motion.circle
        cx={0}
        cy={0}
        r={radius}
        fill="none"
        stroke={isSelected ? 'rgba(34, 211, 238, 0.9)' : 'rgba(34, 211, 238, 0.35)'}
        strokeWidth={2}
        animate={{
          strokeWidth: isSelected ? 2.5 : 2,
        }}
        transition={{ duration: 0.2 }}
      />
      {/* Initial only when no image */}
      {!person.image && (
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--muted-foreground)"
          style={{ fontSize: radius * 0.5, fontFamily: 'var(--font-sans)' }}
        >
          {person.canonicalName.slice(0, 1).toUpperCase() || '?'}
        </text>
      )}
      {/* Name label below circle */}
      <text
        x={0}
        y={radius + 14}
        textAnchor="middle"
        dominantBaseline="hanging"
        fill="var(--muted-foreground)"
        style={{
          fontSize: 'var(--graph-edge-label-size, 11px)',
          fontFamily: 'var(--font-sans)',
          fontWeight: 500,
        }}
      >
        {person.canonicalName.length > 14
          ? person.canonicalName.slice(0, 12) + '…'
          : person.canonicalName}
      </text>
    </motion.g>
  );
}
