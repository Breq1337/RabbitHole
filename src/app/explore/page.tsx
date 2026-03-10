'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { KnowledgeGraph } from '@/components/KnowledgeGraph';
import { DiscoveryFeed } from '@/components/DiscoveryFeed';
import { EntityDetails } from '@/components/EntityDetails';
import { ExplorationTrail } from '@/components/ExplorationTrail';
import { ChromaPeopleGrid } from '@/components/ChromaPeopleGrid';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useTranslation } from '@/contexts/LanguageContext';
import type { Entity, DiscoveryCard, ExplorationStep } from '@/types';

interface ExploreData {
  graph: { nodes: { id: string; name: string; entity?: Entity }[]; links: { source: string; target: string }[] };
  feed: DiscoveryCard[];
  centerEntity: Entity | null;
}

function ExploreLoading() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-grid flex flex-col items-center justify-center p-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full"
      />
      <p className="mt-4 text-[var(--muted)]">{t('mappingConnections')}</p>
    </div>
  );
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const id = searchParams.get('id');
  const trailParam = searchParams.get('trail');

  const [data, setData] = useState<ExploreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [trail, setTrail] = useState<ExplorationStep[]>([]);
  const { t } = useTranslation();

  const fetchExplore = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = id ? `id=${encodeURIComponent(id)}` : `q=${encodeURIComponent(q || '')}`;
      const res = await fetch(`/api/explore?${params}`);
      if (!res.ok) throw new Error('Failed to load');
      const json = await res.json();
      setData(json);
      setSelectedEntity(json.centerEntity || null);
      if (json.centerEntity) {
        const fromTrail = trailParam
          ? trailParam.split('-').map((s) => s.trim()).filter(Boolean).map((s) => (s.startsWith('Q') ? s : `Q${s}`))
          : [];
        const trailSteps: ExplorationStep[] =
          fromTrail.length > 0
            ? fromTrail.map((entityId, i) => ({
                entityId,
                entityName:
                  entityId === json.centerEntity?.id ? json.centerEntity.name : entityId,
                timestamp: Date.now() + i,
              }))
            : [
                {
                  entityId: json.centerEntity.id,
                  entityName: json.centerEntity.name,
                  timestamp: Date.now(),
                },
              ];
        setTrail(trailSteps);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  }, [q, id, trailParam, t]);

  useEffect(() => {
    if (q || id) fetchExplore();
    else setLoading(false);
  }, [q, id, fetchExplore]);

  const handleNodeClick = useCallback(
    (nodeId: string, node: { id: string; name: string; entity?: Entity }) => {
      const entity = node.entity || data?.feed.find((c) => c.id === nodeId)?.entity;
      if (entity) {
        setSelectedEntity(entity);
        setTrail((prev) => {
          const exists = prev.some((s) => s.entityId === entity.id);
          if (exists) return prev;
          return [
            ...prev,
            { entityId: entity.id, entityName: entity.name, timestamp: Date.now() },
          ];
        });
      }
    },
    [data?.feed]
  );

  const handleFeedSelect = useCallback((card: DiscoveryCard) => {
    setSelectedEntity(card.entity);
    setTrail((prev) => {
      const exists = prev.some((s) => s.entityId === card.entity.id);
      if (exists) return prev;
      return [
        ...prev,
        { entityId: card.entity.id, entityName: card.entity.name, timestamp: Date.now() },
      ];
    });
  }, []);

  const buildSharePath = useCallback(() => {
    if (trail.length === 0) return '';
    const segment = trail.map((s) => s.entityId.replace(/^Q/, '')).join('-');
    return `/explore/${segment}`;
  }, [trail]);

  if (!q && !id) {
    return (
      <div className="min-h-screen bg-grid flex flex-col items-center justify-center p-4">
        <p className="text-[var(--muted)]">{t('enterSearchOrTrending')}</p>
        <Link href="/" className="mt-4 text-[var(--accent)] hover:underline">
          {t('backHome')}
        </Link>
      </div>
    );
  }

  if (loading) {
    return <ExploreLoading />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-grid flex flex-col items-center justify-center p-4">
        <p className="text-red-400">{error || t('noData')}</p>
        <Link href="/" className="mt-4 text-[var(--accent)] hover:underline">
          {t('backHome')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grid flex flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-[var(--background)]/80 backdrop-blur border-b border-[var(--border)]">
        <Link href="/" className="text-lg font-semibold text-[var(--foreground)]">
          🕳️ Rabbit Hole
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
          >
            {t('newSearch')}
          </Link>
          <LanguageToggle />
        </div>
      </header>

      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[1600px] mx-auto w-full">
        {/* Left: Discovery feed */}
        <aside className="lg:col-span-3 order-2 lg:order-1">
          <h3 className="text-sm font-medium text-[var(--muted)] mb-3">{t('discoveryFeed')}</h3>
          <DiscoveryFeed
            feed={data.feed}
            onSelect={handleFeedSelect}
            selectedId={selectedEntity?.id}
          />
        </aside>

        {/* Center: Graph */}
        <section className="lg:col-span-6 order-1 lg:order-2 min-h-[360px]">
          <KnowledgeGraph
            data={data.graph}
            onNodeClick={handleNodeClick}
            selectedId={selectedEntity?.id}
          />
        </section>

        {/* Right: Entity details + Related people */}
        <aside className="lg:col-span-3 order-3 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-[var(--muted)] mb-3">{t('details')}</h3>
            <EntityDetails entity={selectedEntity} />
          </div>
          {data.feed.length > 0 && data.feed.some((c) => c.entity?.type === 'person') && (
            <ChromaPeopleGrid
              items={data.feed
                .filter((c) => c.entity?.type === 'person')
                .slice(0, 6)
                .map((c) => ({
                  id: c.entity!.id,
                  name: c.entity!.name,
                  image: c.entity!.image ?? c.image,
                  description: c.entity!.summary ?? c.summary,
                  entityId: c.entity!.id,
                  href: `/explore?id=${c.entity!.id}`,
                }))}
              variant="related"
              maxItems={6}
            />
          )}
        </aside>
      </div>

      {/* Bottom: Exploration trail */}
      <div className="p-4 border-t border-[var(--border)]">
        <ExplorationTrail steps={trail} buildSharePath={buildSharePath} />
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreLoading />}>
      <ExploreContent />
    </Suspense>
  );
}
