'use client';

import Link from 'next/link';
import type { ExplorationStep } from '@/types';

interface ExplorationTrailProps {
  steps: ExplorationStep[];
  buildSharePath: () => string;
}

export function ExplorationTrail({ steps, buildSharePath }: ExplorationTrailProps) {
  if (steps.length === 0) return null;

  const sharePath = buildSharePath();

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--border)]">
      <span className="text-xs text-[var(--muted)] uppercase tracking-wider">Trail</span>
      <div className="flex flex-wrap items-center gap-1">
        {steps.map((step, i) => (
          <span key={step.entityId + step.timestamp} className="flex items-center gap-1">
            <Link
              href={`/explore?id=${encodeURIComponent(step.entityId)}`}
              className="text-sm text-[var(--accent)] hover:underline"
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
          className="ml-2 text-xs text-[var(--muted)] hover:text-[var(--accent)]"
          title="Share this trail"
        >
          Share
        </Link>
      )}
    </div>
  );
}
