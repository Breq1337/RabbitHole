'use client';

import { motion } from 'framer-motion';
import type { ConnectionPath } from '@/types/connect';
import { getPathLayout } from '@/lib/graphLayout';
import { ConnectionGraphEdge } from './ConnectionGraphEdge';
import { ConnectionGraphNode } from './ConnectionGraphNode';

export interface ConnectionGraphProps {
  path: ConnectionPath;
  selectedIndex: number | null;
  onNodeClick?: (index: number) => void;
  className?: string;
  /** For pan/zoom: transform applied to inner g (set by useGraphPanZoom). */
  transform?: string;
  /** Reveal: delay before starting node/edge animation. */
  revealDelay?: number;
}

export function ConnectionGraph({
  path,
  selectedIndex,
  onNodeClick,
  className,
  transform = 'translate(0,0) scale(1)',
  revealDelay = 0,
}: ConnectionGraphProps) {
  const { persons, edges } = path;
  const { positions, width, height, nodeRadius } = getPathLayout(persons.length);

  if (persons.length === 0) return null;

  const staggerMs = 100;

  return (
    <div className={`w-full h-full ${className ?? ''}`.trim()}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full block"
        style={{ overflow: 'visible' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={transform}>
          {/* Edges first (under nodes) */}
          {edges.map((edge, i) => {
            const fromPos = positions[edge.fromIndex];
            const toPos = positions[edge.toIndex];
            if (!fromPos || !toPos) return null;
            return (
              <ConnectionGraphEdge
                key={`edge-${i}`}
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                label={edge.label}
                revealDelay={revealDelay + (edge.fromIndex + 1) * staggerMs}
              />
            );
          })}
          {/* Nodes */}
          {persons.map((person, i) => {
            const pos = positions[i];
            if (!pos) return null;
            return (
              <ConnectionGraphNode
                key={person.id}
                x={pos.x}
                y={pos.y}
                radius={nodeRadius}
                person={person}
                isSelected={selectedIndex === i}
                onClick={() => onNodeClick?.(i)}
                revealDelay={revealDelay + i * staggerMs}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
