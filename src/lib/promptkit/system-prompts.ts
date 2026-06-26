export type { ModelCategory, ModelEcosystem, SourceRef, SystemPromptEntry } from './types';

import { ALL_PROVIDER_ENTRIES } from './providers';
import type { ModelCategory, SystemPromptEntry } from './types';
import { SYSTEM_PROMPT_ENDING_ZH, SHORT_VERSION_ENDING_ZH } from './prompt-endings';

const TEXT = ALL_PROVIDER_ENTRIES.filter(e => e.category === 'text');
const CODE = ALL_PROVIDER_ENTRIES.filter(e => e.category === 'code');
const IMAGE = ALL_PROVIDER_ENTRIES.filter(e => e.category === 'image');
const VIDEO = ALL_PROVIDER_ENTRIES.filter(e => e.category === 'video');
const VISION = ALL_PROVIDER_ENTRIES.filter(e => e.category === 'vision');
const CHARACTER = ALL_PROVIDER_ENTRIES.filter(e => e.category === 'character');
const THREE_D = ALL_PROVIDER_ENTRIES.filter(e => e.category === '3d');
const AUDIO = ALL_PROVIDER_ENTRIES.filter(e => e.category === 'audio');
const DESIGN = ALL_PROVIDER_ENTRIES.filter(e => e.category === 'design');
const EMBEDDING = ALL_PROVIDER_ENTRIES.filter(e => e.category === 'embedding');
const MODERATION = ALL_PROVIDER_ENTRIES.filter(e => e.category === 'moderation');
const WORLD = ALL_PROVIDER_ENTRIES.filter(e => e.category === 'world');

export const ALL_ENTRIES: SystemPromptEntry[] = ALL_PROVIDER_ENTRIES;

export const ENTRIES_BY_CATEGORY: Record<ModelCategory, SystemPromptEntry[]> = {
  text: TEXT,
  code: CODE,
  image: IMAGE,
  video: VIDEO,
  vision: VISION,
  character: CHARACTER,
  '3d': THREE_D,
  audio: AUDIO,
  design: DESIGN,
  embedding: EMBEDDING,
  moderation: MODERATION,
  world: WORLD,
};

const ENTRY_BY_ID = new Map<string, SystemPromptEntry>(ALL_ENTRIES.map(e => [e.id, e]));

export function getEntryById(id: string): SystemPromptEntry | undefined {
  return ENTRY_BY_ID.get(id);
}

export const UNIQUE_PROVIDERS: string[] = Array.from(new Set(ALL_ENTRIES.map(e => e.provider))).sort();

/**
 * Levenshtein edit distance between two strings.
 * Space-optimized — uses two rows instead of full matrix.
 */
function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  // Ensure a is the shorter one for less memory
  if (a.length > b.length) [a, b] = [b, a];

  let prev = new Uint8Array(a.length + 1);
  let curr = new Uint8Array(a.length + 1);

  for (let i = 0; i <= a.length; i++) prev[i] = i;

  for (let j = 1; j <= b.length; j++) {
    curr[0] = j;
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[i] = Math.min(
        prev[i] + 1,
        curr[i - 1] + 1,
        prev[i - 1] + cost,
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[a.length];
}

/**
 * Best fuzzy similarity (0–1) between a query word and any word in `text`.
 * 1 = exact match, 0 = too far apart.
 */
function fuzzyWordSim(queryWord: string, text: string): number {
  if (queryWord.length < 3) return text.includes(queryWord) ? 1 : 0;
  const words = text.split(/[\s,()/+.\-—–]+/).filter(w => w.length > 0);
  let bestDist = Infinity;
  for (const word of words) {
    const dist = levenshtein(queryWord, word);
    if (dist < bestDist) bestDist = dist;
  }
  if (bestDist === Infinity) return 0;
  // Acceptable distance threshold: floor(max(1, queryWord.length / 3))
  const maxAccept = Math.max(1, Math.floor(queryWord.length / 3));
  if (bestDist > maxAccept) return 0;
  return 1 - bestDist / Math.max(queryWord.length, 3);
}

export function getSourceQuality(entry: SystemPromptEntry): 'verified' | 'partial' | 'limited' {
  const officialCount = entry.sources.filter(
    s => s.type === 'docs' || s.type === 'whitepaper' || s.type === 'api-reference' || s.type === 'model-card'
  ).length;
  if (officialCount >= 3) return 'verified';
  if (officialCount >= 1) return 'partial';
  return 'limited';
}

// Pre-computed lowercase fields — avoids 1900+ toLowerCase() calls per keystroke.
const LOWER_ENTRIES: Array<{
  name: string; provider: string; desc: string; cat: string; eco: string;
  tipsLC: string[]; sourceTitlesLC: string[]; shortVer: string; systemPrompt: string;
}> = ALL_ENTRIES.map(e => ({
  name: e.modelName.toLowerCase(),
  provider: e.provider.toLowerCase(),
  desc: e.description.toLowerCase(),
  cat: e.category.toLowerCase(),
  eco: e.ecosystem.toLowerCase(),
  tipsLC: e.tips.map(t => t.toLowerCase()),
  sourceTitlesLC: e.sources.map(s => s.title.toLowerCase()),
  shortVer: e.shortVersion.toLowerCase(),
  systemPrompt: e.systemPrompt.toLowerCase(),
}));

// Cache search results so repeat queries are instant (no Levenshtein recomputation)
const searchCache = new Map<string, SystemPromptEntry[]>();
const SEARCH_CACHE_MAX = 100;

export function searchEntries(query: string): SystemPromptEntry[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();

  const cached = searchCache.get(q);
  if (cached !== undefined) return cached;
  const qWords = q.split(/\s+/).filter(Boolean);
  // Limit early bail — if we already have this many exact matches, skip fuzzy
  const ENOUGH_EXACT = 20;

  const scored: Array<{ entry: SystemPromptEntry; score: number }> = [];

  for (let i = 0; i < ALL_ENTRIES.length; i++) {
    const entry = ALL_ENTRIES[i];
    const lo = LOWER_ENTRIES[i];
    let score = 0;

    if (lo.name === q) score += 100;
    else if (lo.name.startsWith(q)) score += 50;
    else if (qWords.every(w => lo.name.includes(w))) score += 30;
    else if (lo.name.includes(q)) score += 20;

    if (lo.provider.includes(q)) score += 8;

    if (lo.cat === q) score += 15;
    else if (lo.cat.includes(q)) score += 5;

    if (lo.eco === q) score += 10;
    else if (lo.eco.includes(q)) score += 4;

    if (lo.desc.includes(q)) score += 6;
    else if (qWords.some(w => lo.desc.includes(w))) score += 2;

    if (qWords.length > 1) {
      const allText = `${lo.name} ${lo.provider} ${lo.desc} ${lo.cat} ${lo.eco}`;
      if (qWords.every(w => allText.includes(w))) score += 5;
    }

    if (lo.tipsLC.some(t => t.includes(q))) score += 3;
    else if (lo.tipsLC.some(t => qWords.some(w => t.includes(w)))) score += 1;

    if (lo.sourceTitlesLC.some(s => s.includes(q))) score += 3;
    else if (lo.sourceTitlesLC.some(s => qWords.some(w => s.includes(w)))) score += 1;

    if (lo.shortVer.includes(q)) score += 2;
    if (lo.systemPrompt.includes(q)) score += 1;

    if (q.length >= 3 && score < 15 && scored.length < ENOUGH_EXACT) {
      for (const w of qWords) {
        const nameSim = fuzzyWordSim(w, lo.name);
        if (nameSim > 0.5) { score += Math.round(nameSim * 25); break; }
      }
      if (score < 10) {
        for (const w of qWords) {
          const provSim = fuzzyWordSim(w, lo.provider);
          if (provSim > 0.5) { score += Math.round(provSim * 8); break; }
        }
      }
    }

    if (score > 0) scored.push({ entry, score });
  }

  const result = scored.sort((a, b) => b.score - a.score).map(s => s.entry);

  if (searchCache.size >= SEARCH_CACHE_MAX) {
    const first = searchCache.keys().next().value;
    if (first !== undefined) searchCache.delete(first);
  }
  searchCache.set(q, result);
  return result;
}

export type SortField = 'name' | 'provider' | 'quality' | 'date' | 'ranking';
export type SortOrder = 'asc' | 'desc';

export function sortEntries(
  entries: SystemPromptEntry[],
  field: SortField,
  order: SortOrder
): SystemPromptEntry[] {
  const sorted = [...entries].sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case 'name':
        cmp = a.modelName.localeCompare(b.modelName);
        break;
      case 'provider':
        cmp = a.provider.localeCompare(b.provider);
        break;
      case 'quality': {
        const qa = getSourceQuality(a);
        const qb = getSourceQuality(b);
        const rank = { verified: 3, partial: 2, limited: 1 };
        cmp = (rank[qa] ?? 0) - (rank[qb] ?? 0);
        break;
      }
      case 'date':
        cmp = a.lastVerified.localeCompare(b.lastVerified);
        break;
    }
    return order === 'desc' ? -cmp : cmp;
  });
  return sorted;
}

export function highlightMatches(text: string, query: string): string {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark class="bg-amber-500/20 text-amber-500 rounded-sm px-0.5">$1</mark>');
}

const CHINESE_CATEGORIES = new Set(['image', 'video', '3d']);

export function getDisplayPrompt(entry: SystemPromptEntry, type: 'full' | 'short', useChinese: boolean): string {
  const base = type === 'full' ? entry.systemPrompt : entry.shortVersion;
  if (!useChinese) return base;
  if (entry.ecosystem !== 'chinese') return base;
  if (!CHINESE_CATEGORIES.has(entry.category)) return base;
  const ending = type === 'full' ? SYSTEM_PROMPT_ENDING_ZH : SHORT_VERSION_ENDING_ZH;
  return base + ending;
}
