'use client';

import { motion } from 'framer-motion';
import { SearchBar } from '@/components/SearchBar';
import { TrendingSection } from '@/components/TrendingSection';
import { RandomButton } from '@/components/RandomButton';
import { QuizModal } from '@/components/QuizModal';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-grid">
      <QuizModal />
      <header className="pt-6 px-4 flex justify-between items-center max-w-4xl mx-auto">
        <Link href="/" className="text-lg font-semibold text-[var(--foreground)]">
          🕳️ Rabbit Hole
        </Link>
        <nav className="text-sm text-[var(--muted)]">
          <Link href="/explore?q=Albert+Einstein" className="hover:text-[var(--accent)] transition-colors">
            Try it
          </Link>
        </nav>
      </header>

      <main className="flex flex-col items-center justify-center px-4 pt-12 pb-20 min-h-[80vh]">
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-center text-[var(--foreground)] mb-2 glow-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Search one thing.
        </motion.h1>
        <motion.p
          className="text-xl sm:text-2xl text-[var(--muted)] text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Lose yourself in everything.
        </motion.p>

        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <SearchBar />
        </motion.div>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <RandomButton />
        </motion.div>

        <TrendingSection />
      </main>

      <footer className="py-6 text-center text-sm text-[var(--muted)]">
        A cinematic curiosity engine. No login required.
      </footer>
    </div>
  );
}
