'use client';

import { useTranslation } from '@/contexts/LanguageContext';

export function LanguageToggle() {
  const { locale, setLocale, t } = useTranslation();
  const isPt = locale === 'pt';

  return (
    <button
      type="button"
      onClick={() => setLocale(isPt ? 'en' : 'pt')}
      className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors py-1 px-2 rounded border border-[var(--border)] hover:border-[var(--accent)]/50"
      title={t('langLabel')}
      aria-label={t('langLabel')}
    >
      {isPt ? t('langSwitchToEn') : t('langSwitchToPt')}
    </button>
  );
}
