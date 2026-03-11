'use client';

import { useEffect, useState } from 'react';
<<<<<<< HEAD
import { useParams } from 'next/navigation';
=======
import { useParams, useRouter } from 'next/navigation';
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ConnectionResult } from '@/components/connect/ConnectionResult';
import { useTranslation } from '@/contexts/LanguageContext';
<<<<<<< HEAD
=======
import type { Person } from '@/types/connect';
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
import type { ConnectionPath } from '@/types/connect';

function slugToQuery(slug: string): string {
  return decodeURIComponent(slug).replace(/-/g, ' ');
}

export default function ConnectShareablePage() {
  const params = useParams();
<<<<<<< HEAD
=======
  const router = useRouter();
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
  const { t } = useTranslation();
  const personASlug = params.personA as string;
  const personBSlug = params.personB as string;

<<<<<<< HEAD
  const [result, setResult] = useState<
    (ConnectionPath & { personA?: unknown; personB?: unknown }) | { error: string } | null
  >(null);
=======
  const [personA, setPersonA] = useState<Person | null>(null);
  const [personB, setPersonB] = useState<Person | null>(null);
  const [result, setResult] = useState<ConnectionPath | { error: string } | null>(null);
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!personASlug || !personBSlug) {
      setIsLoading(false);
      return;
    }
<<<<<<< HEAD
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
=======
    const queryA = slugToQuery(personASlug);
    const queryB = slugToQuery(personBSlug);

    (async () => {
      try {
        const [resA, resB] = await Promise.all([
          fetch('/api/connect/resolve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: queryA }),
          }),
          fetch('/api/connect/resolve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: queryB }),
          }),
        ]);
        const dataA = await resA.json();
        const dataB = await resB.json();
        const peopleA = dataA.people ?? [];
        const peopleB = dataB.people ?? [];
        const pA = peopleA[0] ?? null;
        const pB = peopleB[0] ?? null;
        setPersonA(pA);
        setPersonB(pB);

        if (pA && pB) {
          const searchRes = await fetch('/api/connect/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              personAId: pA.id,
              personBId: pB.id,
            }),
          });
          const searchData = await searchRes.json();
          setResult(searchData.path ?? { error: searchData.error ?? t('noConnectionFound') });
        } else {
          setResult({ error: t('noConnectionFound') });
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
        }
      } catch {
        setResult({ error: t('noConnectionFound') });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [personASlug, personBSlug, t]);

  const handleNewSearch = () => {
<<<<<<< HEAD
    window.location.href = '/connect';
=======
    router.push('/connect');
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
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

<<<<<<< HEAD
      <main className="max-w-2xl mx-auto px-4 py-12 sm:max-w-4xl">
=======
      <main className="max-w-2xl mx-auto px-4 py-12">
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
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
<<<<<<< HEAD
          <ConnectionResult isLoading />
=======
          <div className="flex flex-col items-center justify-center py-16">
            <span className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-[var(--muted-foreground)]">{t('connecting')}</p>
          </div>
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
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

<<<<<<< HEAD
function isConnectionPath(
  r: ConnectionPath | { error: string }
): r is ConnectionPath {
=======
function isConnectionPath(r: ConnectionPath | { error: string }): r is ConnectionPath {
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
  return 'persons' in r && Array.isArray(r.persons);
}
