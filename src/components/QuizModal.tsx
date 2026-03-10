'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/contexts/LanguageContext';

const QUIZ_TOPICS = [
  'Science',
  'History',
  'Technology',
  'Movies',
  'Space',
  'Psychology',
  'Art',
  'Random discoveries',
] as const;

const QUIZ_TOPIC_KEYS: Record<(typeof QUIZ_TOPICS)[number], 'quizTopicScience' | 'quizTopicHistory' | 'quizTopicTechnology' | 'quizTopicMovies' | 'quizTopicSpace' | 'quizTopicPsychology' | 'quizTopicArt' | 'quizTopicRandom'> = {
  Science: 'quizTopicScience',
  History: 'quizTopicHistory',
  Technology: 'quizTopicTechnology',
  Movies: 'quizTopicMovies',
  Space: 'quizTopicSpace',
  Psychology: 'quizTopicPsychology',
  Art: 'quizTopicArt',
  'Random discoveries': 'quizTopicRandom',
};

export function QuizModal({ forceOpen, onClose }: { forceOpen?: boolean; onClose?: () => void } = {}) {
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const done = localStorage.getItem('rabbithole-quiz-done');
    if (!done) setShow(true);
  }, []);

  const isOpen = show || Boolean(forceOpen);

  const finish = () => {
    localStorage.setItem('rabbithole-quiz-done', 'true');
    if (selected.size > 0) {
      localStorage.setItem('rabbithole-preferences', JSON.stringify({ topics: [...selected] }));
    }
    setShow(false);
    onClose?.();
  };

  const toggle = (topic: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => finish()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-full max-w-md rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-1">
              {t('quizTitle')}
            </h3>
            <p className="text-sm text-[var(--muted)] mb-6">
              {t('quizSubtitle')}
            </p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {QUIZ_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggle(topic)}
                  className={`py-3 px-4 rounded-xl border text-left text-sm transition-colors ${
                    selected.has(topic)
                      ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]'
                      : 'border-[var(--border)] bg-transparent text-[var(--foreground)] hover:border-[var(--muted)]'
                  }`}
                >
                  {t(QUIZ_TOPIC_KEYS[topic])}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={finish}
                className="flex-1 py-3 rounded-xl bg-[var(--accent)] text-[var(--background)] font-medium hover:opacity-90 transition-opacity"
              >
                {t('startExploring')}
              </button>
              <button
                type="button"
                onClick={finish}
                className="py-3 px-4 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                {t('skip')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
