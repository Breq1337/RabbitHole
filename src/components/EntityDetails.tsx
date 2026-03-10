'use client';

import Link from 'next/link';
import type { Entity } from '@/types';
import Image from 'next/image';

interface EntityDetailsProps {
  entity: Entity | null;
}

export function EntityDetails({ entity }: EntityDetailsProps) {
  if (!entity) {
    return (
      <div className="p-4 text-[var(--muted)] text-sm rounded-xl border border-[var(--border)] bg-[var(--card-bg)]">
        Click a node or a discovery card to see details.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden">
      {entity.image && (
        <div className="relative w-full aspect-video bg-[var(--border)]">
          <Image
            src={entity.image}
            alt={entity.name}
            fill
            className="object-cover"
            sizes="(max-width: 400px) 100vw, 320px"
            unoptimized
          />
        </div>
      )}
      <div className="p-4">
        <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider">
          {entity.type}
        </span>
        <h2 className="text-xl font-semibold text-[var(--foreground)] mt-1">{entity.name}</h2>
        <p className="text-sm text-[var(--muted)] mt-2 line-clamp-5">
          {entity.summary || entity.description || 'No description available.'}
        </p>
        {entity.interestingFact && (
          <p className="text-xs text-[var(--accent)]/90 mt-3 italic border-l-2 border-[var(--accent)]/50 pl-3">
            {entity.interestingFact}
          </p>
        )}
        {entity.wikipediaUrl && (
          <a
            href={entity.wikipediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-4 text-sm text-[var(--accent)] hover:underline"
          >
            Read on Wikipedia →
          </a>
        )}
        <Link
          href={`/entity/${entity.id}`}
          className="block mt-3 text-sm text-[var(--muted)] hover:text-[var(--accent)]"
        >
          Full entity page →
        </Link>
      </div>
    </div>
  );
}
