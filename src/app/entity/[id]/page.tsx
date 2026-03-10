'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Entity } from '@/types';

export default function EntityPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const [entity, setEntity] = useState<Entity | null>(null);
  const [related, setRelated] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/entity/${encodeURIComponent(id)}`);
      if (!res.ok) {
        setEntity(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setEntity(data.entity);
      setRelated(data.related ?? []);
    } catch {
      setEntity(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!id) {
    return (
      <div className="min-h-screen bg-grid flex items-center justify-center p-4">
        <p className="text-[var(--muted)]">Missing entity ID.</p>
        <Link href="/" className="ml-4 text-[var(--accent)]">← Home</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-grid flex items-center justify-center p-4">
        <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="min-h-screen bg-grid flex flex-col items-center justify-center p-4">
        <p className="text-red-400">Entity not found.</p>
        <Link href="/" className="mt-4 text-[var(--accent)]">← Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grid">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-[var(--background)]/80 backdrop-blur border-b border-[var(--border)]">
        <Link href="/" className="text-lg font-semibold text-[var(--foreground)]">🕳️ Rabbit Hole</Link>
        <button
          type="button"
          onClick={() => router.push(`/explore?id=${encodeURIComponent(id)}`)}
          className="text-sm text-[var(--accent)] hover:underline"
        >
          Explore graph →
        </button>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        {entity.image && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[var(--border)] mb-6">
            <Image src={entity.image} alt={entity.name} fill className="object-cover" sizes="800px" unoptimized />
          </div>
        )}
        <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider">{entity.type}</span>
        <h1 className="text-3xl font-bold text-[var(--foreground)] mt-1">{entity.name}</h1>
        <p className="text-[var(--muted)] mt-4 leading-relaxed">
          {entity.summary || entity.description || 'No description available.'}
        </p>
        {entity.interestingFact && (
          <p className="text-sm text-[var(--accent)]/90 mt-4 italic border-l-2 border-[var(--accent)]/50 pl-4">
            {entity.interestingFact}
          </p>
        )}
        {entity.wikipediaUrl && (
          <a
            href={entity.wikipediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex mt-6 text-[var(--accent)] hover:underline"
          >
            Read on Wikipedia →
          </a>
        )}

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider mb-4">Related</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/explore?id=${encodeURIComponent(r.id)}`}
                  className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--accent)]/50 transition-colors"
                >
                  <span className="font-medium text-[var(--foreground)]">{r.name}</span>
                  <span className="text-xs text-[var(--muted)] block mt-1">{r.type}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
