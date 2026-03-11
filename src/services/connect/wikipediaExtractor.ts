// Wikipedia person extractor: infobox, categories, links -> PersonEdge[]

import type { PersonEdge, RelationType } from '@/types/connect';
import { fetchParse, getWikidataIdFromTitle } from '@/lib/mediawiki';
import { getFromCache, setCache } from '@/lib/cache';

const INFOBOX_FIELDS: Record<string, { type: RelationType; label: string }> = {
  spouse: { type: 'MARRIED_TO', label: 'married to' },
  partner: { type: 'DATED', label: 'partner of' },
  children: { type: 'FAMILY_OF', label: 'family connection' },
  parents: { type: 'FAMILY_OF', label: 'family connection' },
  mother: { type: 'FAMILY_OF', label: 'family connection' },
  father: { type: 'FAMILY_OF', label: 'family connection' },
  education: { type: 'SHARED_INSTITUTION', label: 'studied at same place' },
  alma_mater: { type: 'SHARED_INSTITUTION', label: 'studied at same place' },
  employer: { type: 'WORKED_WITH', label: 'worked with' },
  coach: { type: 'COACHED_BY', label: 'coached by' },
  manager: { type: 'COACHED_BY', label: 'managed by' },
  doctoral_advisor: { type: 'MENTORED_BY', label: 'mentored by' },
  influences: { type: 'INSPIRED', label: 'inspired by' },
  influenced_by: { type: 'INSPIRED', label: 'inspired by' },
  successor: { type: 'SUCCESSOR_OF', label: 'succeeded' },
  predecessor: { type: 'PREDECESSOR_OF', label: 'preceded' },
};

const INFOBOX_REGEX = /\|\s*([a-z_]+)\s*=\s*([^|}\n]+)/gi;

function parseInfobox(text: string): Map<string, string[]> {
  const map = new Map<string, string[]>();
  const infoboxMatch = text.match(/\{\{Infobox[\s\S]*?\}\}\s*\n?/);
  if (!infoboxMatch) return map;

  const infobox = infoboxMatch[0];
  let m: RegExpExecArray | null;
  INFOBOX_REGEX.lastIndex = 0;
  while ((m = INFOBOX_REGEX.exec(infobox)) !== null) {
    const key = m[1].toLowerCase().replace(/\s/g, '_');
    const val = m[2].trim();
    const links = val.match(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g) ?? [];
    const targets = links.map((l) => {
      const inner = l.replace(/^\[\[|\]\]$/g, '').split('|')[0].trim();
      return inner;
    });
    if (targets.length === 0 && val && !val.startsWith('{{')) {
      targets.push(val.replace(/\[\[|\]\]/g, '').split('|')[0].trim());
    }
    if (targets.length > 0) {
      const existing = map.get(key) ?? [];
      map.set(key, [...existing, ...targets.filter(Boolean)]);
    }
  }
  return map;
}

function extractLinksFromWikitext(text: string): string[] {
  const links: string[] = [];
  const re = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    links.push(m[1].split('|')[0].trim());
  }
  return [...new Set(links)];
}

const TITLE2QID_TTL = 86400; // 24h

async function resolveTitleToQid(title: string): Promise<string | null> {
  const key = `connect:title2qid:${title.toLowerCase().trim()}`;
  const cached = getFromCache<string>(key);
  if (cached) return cached;
  const qid = await getWikidataIdFromTitle(title);
  if (qid) setCache(key, qid, TITLE2QID_TTL);
  return qid;
}

async function resolveTitlesToQidsBatch(titles: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(titles.map((t) => t.trim()).filter(Boolean))];
<<<<<<< HEAD
  const BATCH = 15;
=======
  const BATCH = 5;
>>>>>>> 27823babd34dc607940de5ccd0a48669d086112f
  const map = new Map<string, string>();
  for (let i = 0; i < unique.length; i += BATCH) {
    const chunk = unique.slice(i, i + BATCH);
    const results = await Promise.all(chunk.map((t) => resolveTitleToQid(t)));
    chunk.forEach((t, j) => {
      const qid = results[j];
      if (qid) map.set(t, qid);
    });
  }
  return map;
}

export async function extractNeighbors(wikipediaTitle: string): Promise<PersonEdge[]> {
  const page = await fetchParse(wikipediaTitle);
  if (!page) return [];

  const sourceId = await resolveTitleToQid(page.title);
  if (!sourceId) return [];

  const edges: PersonEdge[] = [];
  const infobox = parseInfobox(page.text);

  const infoboxTitles: string[] = [];
  for (const [, targets] of infobox) {
    infoboxTitles.push(...targets.slice(0, 5));
  }
  const allLinks = [
    ...extractLinksFromWikitext(page.text),
    ...page.links,
  ].filter((t) => t !== page.title && !t.startsWith('Category:') && !t.startsWith('File:'));
  const bioSections = ['Career', 'Personal life', 'Filmography', 'Discography', 'Early life'];
  const sectionLinks = extractLinksFromSection(page.text, bioSections);
  const candidates = [...new Set([...sectionLinks, ...allLinks.slice(0, 30)])].slice(0, 20);

  const titlesToResolve = [...new Set([...infoboxTitles, ...candidates])];
  const qidMap = await resolveTitlesToQidsBatch(titlesToResolve);

  for (const [field, targets] of infobox) {
    const mapping = INFOBOX_FIELDS[field];
    if (!mapping) continue;
    for (const targetTitle of targets.slice(0, 5)) {
      const tid = qidMap.get(targetTitle.trim());
      if (tid && tid !== sourceId) {
        edges.push({
          sourcePersonId: sourceId,
          targetPersonId: tid,
          relationType: mapping.type,
          relationLabel: mapping.label,
          evidenceType: 'infobox',
          sourceWikipediaPages: [page.title],
          confidence: 0.85,
        });
      }
    }
  }

  const existingTargets = new Set(edges.map((e) => e.targetPersonId));
  for (const targetTitle of candidates) {
    const tid = qidMap.get(targetTitle.trim());
    if (tid && tid !== sourceId && !existingTargets.has(tid)) {
      const exists = edges.some(
        (e) =>
          (e.sourcePersonId === sourceId && e.targetPersonId === tid) ||
          (e.sourcePersonId === tid && e.targetPersonId === sourceId)
      );
      if (!exists) {
        existingTargets.add(tid);
        edges.push({
          sourcePersonId: sourceId,
          targetPersonId: tid,
          relationType: 'COLLABORATED_WITH',
          relationLabel: 'connected to',
          evidenceType: 'bio_link',
          sourceWikipediaPages: [page.title],
          confidence: 0.5,
        });
      }
    }
  }

  return edges;
}

function extractLinksFromSection(text: string, sectionHeaders: string[]): string[] {
  const links: string[] = [];
  for (const header of sectionHeaders) {
    const re = new RegExp(`===\\s*${escapeRe(header)}\\s*===([\\s\\S]*?)(?===|$)`, 'i');
    const m = text.match(re);
    if (m) {
      links.push(...extractLinksFromWikitext(m[1]));
    }
  }
  return [...new Set(links)];
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
