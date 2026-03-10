'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { SearchBar } from '@/components/SearchBar';
import { RandomButton } from '@/components/RandomButton';
import { TrendingChromaSection } from '@/components/TrendingChromaSection';
import { QuizModal } from '@/components/QuizModal';
import { FaultyTerminal } from '@/components/ui/FaultyTerminal';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useTranslation } from '@/contexts/LanguageContext';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function HomePage() {
  const { t } = useTranslation();
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 w-full h-full -z-20 bg-[var(--background)]" />
      <div className="fixed inset-0 w-full h-full -z-10">
        <FaultyTerminal
          scale={2.7}
          digitSize={1.5}
          scanlineIntensity={0.25}
          glitchAmount={0.8}
          flickerAmount={0.8}
          noiseAmp={0}
          chromaticAberration={0}
          dither={0}
          curvature={0.2}
          tint="#ffffff"
          mouseReact
          mouseStrength={0.15}
          brightness={0.98}
        />
      </div>

      <div className="relative z-10 min-h-screen bg-grid-hero">
        <QuizModal forceOpen={quizOpen} onClose={() => setQuizOpen(false)} />

        <header className="pt-6 px-4 flex justify-between items-center max-w-4xl mx-auto">
          <Link
            href="/"
            className="text-lg font-semibold text-[var(--foreground)] tracking-tight hover:text-[var(--accent)] transition-colors duration-200"
          >
            <span className="opacity-90">🕳️</span> Rabbit Hole
          </Link>
          <nav className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
            <Link href="/explore?q=Albert+Einstein" className="hover:text-[var(--accent)] transition-colors duration-200">
              {t('tryIt')}
            </Link>
            <Link href="/connect" className="hover:text-[var(--accent)] transition-colors duration-200">
              Six Degrees
            </Link>
            <motion.button
              type="button"
              onClick={() => setQuizOpen(true)}
              className="hover:text-[var(--accent)] transition-colors duration-200 hidden sm:inline"
            >
              ✨ Quiz
            </motion.button>
            <LanguageToggle />
          </nav>
        </header>

        <main className="flex flex-col items-center px-4 pt-6 sm:pt-10 pb-24">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="w-full max-w-2xl mx-auto flex flex-col items-center"
          >
            <motion.h1
              variants={item}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-[var(--foreground)] mb-2 glow-text tracking-tight"
            >
              {t('searchOneThing')}
            </motion.h1>
            <motion.p
              variants={item}
              className="text-lg sm:text-xl text-[var(--muted-foreground)] text-center mb-8 sm:mb-10"
            >
              {t('loseYourself')}
            </motion.p>

            <motion.div variants={item} className="w-full">
              <SearchBar />
            </motion.div>

            <motion.p
              variants={item}
              className="text-center text-[var(--muted-foreground)] text-sm mt-3"
            >
              {t('searchHint')}
            </motion.p>

            <motion.div
              variants={item}
              className="flex flex-wrap items-center justify-center gap-3 mt-8 sm:mt-10"
            >
              <Link
                href="/connect"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--accent)]/20 text-[var(--accent)] font-medium hover:bg-[var(--accent)]/30 border border-[var(--accent)]/30 transition-all"
              >
                <span aria-hidden>🔗</span>
                {t('connectTitle')}
              </Link>
              <RandomButton />
              <motion.button
                type="button"
                onClick={() => setQuizOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--muted)] hover:bg-[var(--card-bg)] transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span aria-hidden>✨</span>
                <span>{t('startQuiz')}</span>
              </motion.button>
            </motion.div>

            <motion.div variants={item} className="w-full mt-12">
              <TrendingChromaSectionWrapper />
            </motion.div>
          </motion.div>
        </main>

        <footer className="py-6 text-center text-sm text-[var(--muted-foreground)]">
          {t('footerTagline')}
        </footer>
      </div>
    </div>
  );
}

function TrendingChromaSectionWrapper() {
  return <TrendingChromaSection />;
}
