'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { HeroDualSearch } from '@/components/HeroDualSearch';
import { FaultyTerminal } from '@/components/ui/FaultyTerminal';
import { ConnectionResult } from '@/components/connect/ConnectionResult';
import { ChromaPeopleGrid } from '@/components/ChromaPeopleGrid';
import { useTranslation } from '@/contexts/LanguageContext';
import type { Person } from '@/types/connect';
import type { ConnectionPath } from '@/types/connect';

export default function ConnectPage() {
  const { t } = useTranslation();
  const [result, setResult] = useState<ConnectionPath | { error: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (a: Person, b: Person) => {
    setIsLoading(true);
    setResult(null);
    try {
<<<<<<< HEAD
      const res = await fetch('/api/connect/find', {
=======
      const res = await fetch('/api/connect/search', {
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personAId: a.id,
          personBId: b.id,
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
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 -z-20 bg-[var(--background)]" />
      <div className="fixed inset-0 -z-10">
        <FaultyTerminal
          scale={2.7}
          digitSize={1.5}
          scanlineIntensity={0.2}
          glitchAmount={0.6}
          flickerAmount={0.6}
          noiseAmp={0}
          chromaticAberration={0}
          dither={0}
          curvature={0.2}
          tint="#ffffff"
          mouseReact
          mouseStrength={0.12}
          brightness={0.98}
        />
      </div>
      <div className="relative z-10 min-h-screen bg-grid-hero">
      <header className="pt-6 px-4 flex justify-between items-center max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-lg font-semibold text-[var(--foreground)] tracking-tight hover:text-[var(--accent)] transition-colors"
        >
          <span className="opacity-90">🕳️</span> Rabbit Hole
        </Link>
        <Link
          href="/explore"
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors"
        >
          {t('exploreGraph')}
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-2">
            {t('connectTitle')}
          </h1>
          <p className="text-[var(--muted-foreground)]">
            {t('connectSubtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <HeroDualSearch onSearch={handleSearch} isLoading={isLoading} />
        </motion.div>

<<<<<<< HEAD
        {(isLoading || result) && (
          <div className="w-full max-w-4xl mx-auto mt-8">
            {isLoading && (
              <ConnectionResult isLoading />
            )}
            {!isLoading && result && isConnectionPath(result) && (
              <>
                <ConnectionResult path={result} />
                {result.persons.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-[var(--border)] max-w-2xl mx-auto px-4">
=======
        {result && (
          <>
            {isConnectionPath(result) ? (
              <>
                <ConnectionResult path={result} />
                {result.persons.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-[var(--border)]">
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
                    <ChromaPeopleGrid
                      items={result.persons.map((p) => ({
                        id: p.id,
                        name: p.canonicalName,
                        image: p.image,
                        description: p.shortDescription,
                        href: p.wikipediaUrl ?? `/explore?id=${p.id}`,
                        entityId: p.id,
                      }))}
                      variant="continueExploring"
                      maxItems={6}
                    />
                  </div>
                )}
              </>
<<<<<<< HEAD
            )}
            {!isLoading && result && !isConnectionPath(result) && (
=======
            ) : (
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 text-center text-[var(--muted-foreground)]"
              >
                {result.error}
              </motion.p>
            )}
<<<<<<< HEAD
          </div>
=======
          </>
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
        )}
      </main>
      </div>
    </div>
  );
}

function isConnectionPath(
  r: ConnectionPath | { error: string }
): r is ConnectionPath {
  return 'persons' in r && Array.isArray(r.persons);
}
