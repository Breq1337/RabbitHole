'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ConnectionResult } from '@/components/connect/ConnectionResult';
import { useTranslation } from '@/contexts/LanguageContext';
import type { ConnectionPath } from '@/types/connect';

function slugToQuery(slug: string): string {
  return decodeURIComponent(slug).replace(/-/g, ' ');
}

export default function ConnectShareablePage() {
  const params = useParams();
  const { t } = useTranslation();
  const personASlug = params.personA as string;
  const personBSlug = params.personB as string;

  const [result, setResult] = useState<
    (ConnectionPath & { personA?: unknown; personB?: unknown }) | { error: string } | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!personASlug || !personBSlug) {
      setIsLoading(false);
      return;
    }
    const personAQuery = slugToQuery(personASlug);
    const personBQuery = slugToQuery(personBSlug);

    (async () => {
      try {
        const res = await fetch('/api/connect/find', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personAQuery,
            personBQuery,
          }),
        });
        const data = await res.json();
        if (data.path) {
          setResult(data.path);
        } else {
          setResult({ error: data.error ?? t('noConnectionFound') });
        }
      } catch {
        setResult({ error: t('noConnectionFound') });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [personASlug, personBSlug, t]);

  const handleNewSearch = () => {
    window.location.href = '/connect';
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-20 bg-[var(--background)]" />
      <header className="pt-6 px-4 flex justify-between items-center max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-lg font-semibold text-[var(--foreground)] tracking-tight hover:text-[var(--accent)] transition-colors"
        >
          <span className="opacity-90">🕳️</span> Rabbit Hole
        </Link>
        <button
          type="button"
          onClick={handleNewSearch}
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors"
        >
          {t('newSearch')}
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12 sm:max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-2">
            {t('connectTitle')}
          </h1>
          <p className="text-[var(--muted-foreground)]">
            {slugToQuery(personASlug)} ↔ {slugToQuery(personBSlug)}
          </p>
        </motion.div>

        {isLoading ? (
          <ConnectionResult isLoading />
        ) : result && isConnectionPath(result) ? (
          <ConnectionResult path={result} />
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-[var(--muted-foreground)]"
          >
            {result?.error ?? t('noConnectionFound')}
          </motion.p>
        )}
      </main>
    </div>
  );
}

function isConnectionPath(
  r: ConnectionPath | { error: string }
): r is ConnectionPath {
  return 'persons' in r && Array.isArray(r.persons);
}
