'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { GraphData, Entity } from '@/types';

const ForceGraph2D = dynamic(
  () => import('react-force-graph').then((mod) => mod.ForceGraph2D),
  { ssr: false }
);

interface KnowledgeGraphProps {
  data: GraphData;
  onNodeClick?: (nodeId: string, node: { id: string; name: string; entity?: Entity }) => void;
  selectedId?: string | null;
}

export function KnowledgeGraph({ data, onNodeClick, selectedId }: KnowledgeGraphProps) {
  const graphRef = useRef<{ zoomToFit: (duration?: number, padding?: number) => void } | null>(null);
  const initialFit = useRef(true);

  const handleNodeClick = useCallback(
    (node: { id: string; name?: string; entity?: Entity }) => {
      onNodeClick?.(node.id, { id: node.id, name: node.name ?? node.id, entity: node.entity });
    },
    [onNodeClick]
  );

  const nodeCanvasObject = useCallback(
    (node: unknown, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const n = node as { id: string; name: string; x?: number; y?: number; val?: number; group?: string };
      const label = n.name;
      const fontSize = Math.max(10, 12 / globalScale);
      const isCenter = n.group === 'center';
      const isSelected = n.id === selectedId;
      const size = (n.val ?? 8) * (isCenter ? 1.5 : 1) + (isSelected ? 4 : 0);

      ctx.font = `${fontSize}px system-ui, sans-serif`;
      const textWidth = ctx.measureText(label).width;
      const maxLabel = label.length > 18 ? label.slice(0, 16) + '…' : label;

      // Glow
      ctx.beginPath();
      ctx.arc(n.x ?? 0, n.y ?? 0, size + 4, 0, 2 * Math.PI);
      ctx.fillStyle = isCenter || isSelected ? 'rgba(34, 211, 238, 0.25)' : 'rgba(34, 211, 238, 0.08)';
      ctx.fill();

      // Node circle
      ctx.beginPath();
      ctx.arc(n.x ?? 0, n.y ?? 0, size, 0, 2 * Math.PI);
      ctx.fillStyle = isCenter ? '#22d3ee' : isSelected ? '#22d3ee' : '#3f3f46';
      ctx.fill();
      ctx.strokeStyle = isSelected || isCenter ? '#22d3ee' : '#52525b';
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();

      // Label
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#e8e8ed';
      ctx.fillText(maxLabel, n.x ?? 0, (n.y ?? 0) + size + fontSize + 2);
    },
    [selectedId]
  );

  useEffect(() => {
    if (!initialFit.current || data.nodes.length === 0) return;
    const t = setTimeout(() => {
      graphRef.current?.zoomToFit?.(400, 40);
      initialFit.current = false;
    }, 800);
    return () => clearTimeout(t);
  }, [data.nodes.length]);

  if (data.nodes.length === 0) {
    return (
      <div className="w-full h-full min-h-[320px] flex items-center justify-center bg-[var(--card-bg)] rounded-xl border border-[var(--border)]">
        <span className="text-[var(--muted)]">No graph data yet.</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[320px] rounded-xl overflow-hidden bg-[var(--card-bg)] border border-[var(--border)] node-glow">
      <ForceGraph2D
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={graphRef as any}
        graphData={data}
        nodeLabel={(node) => (node as { name: string }).name}
        onNodeClick={(node: unknown) => handleNodeClick(node as { id: string; name?: string; entity?: Entity })}
        nodeCanvasObject={nodeCanvasObject}
        linkColor={() => 'rgba(34, 211, 238, 0.35)'}
        linkWidth={1.5}
        backgroundColor="var(--card-bg)"
        nodeRelSize={6}
        cooldownTicks={100}
        onEngineStop={() => {
          if (initialFit.current && graphRef.current) {
            graphRef.current.zoomToFit(400, 40);
            initialFit.current = false;
          }
        }}
      />
    </div>
  );
}
