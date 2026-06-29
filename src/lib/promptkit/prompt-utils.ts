export type SortField = 'name' | 'provider' | 'quality' | 'date' | 'ranking';
export type SortOrder = 'asc' | 'desc';

export function getSourceQuality(
  entry: { sources: Array<{ type: string }> },
): 'verified' | 'partial' | 'limited' {
  const officialCount = entry.sources.filter(
    s =>
      s.type === 'docs' ||
      s.type === 'whitepaper' ||
      s.type === 'api-reference' ||
      s.type === 'model-card',
  ).length;
  if (officialCount >= 3) return 'verified';
  if (officialCount >= 1) return 'partial';
  return 'limited';
}

export function sortEntries<T extends { modelName: string; provider: string; lastVerified: string }>(
  entries: T[],
  field: SortField,
  order: SortOrder,
): T[] {
  const sorted = [...entries].sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case 'name':
        cmp = a.modelName.localeCompare(b.modelName);
        break;
      case 'provider':
        cmp = a.provider.localeCompare(b.provider);
        break;
      case 'quality':
        cmp = 0; // quality sorting needs getSourceQuality, done in component
        break;
      case 'date':
        cmp = a.lastVerified.localeCompare(b.lastVerified);
        break;
    }
    return order === 'desc' ? -cmp : cmp;
  });
  return sorted;
}

function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  if (a.length > b.length) [a, b] = [b, a];
  let prev = new Uint8Array(a.length + 1);
  let curr = new Uint8Array(a.length + 1);
  for (let i = 0; i <= a.length; i++) prev[i] = i;
  for (let j = 1; j <= b.length; j++) {
    curr[0] = j;
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[i] = Math.min(prev[i] + 1, curr[i - 1] + 1, prev[i - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[a.length];
}

function fuzzyWordSim(queryWord: string, text: string): number {
  if (queryWord.length < 3) return text.includes(queryWord) ? 1 : 0;
  const words = text.split(/[\s,()/+.\-—–]+/).filter(w => w.length > 0);
  let bestDist = Infinity;
  for (const word of words) {
    const dist = levenshtein(queryWord, word);
    if (dist < bestDist) bestDist = dist;
  }
  if (bestDist === Infinity) return 0;
  const maxAccept = Math.max(1, Math.floor(queryWord.length / 3));
  if (bestDist > maxAccept) return 0;
  return 1 - bestDist / Math.max(queryWord.length, 3);
}

export interface FlatEntry {
  id: string;
  modelName: string;
  provider: string;
  description: string;
  category: string;
  ecosystem: string;
  tips: string[];
  sources: Array<{ title: string; url: string; type: string }>;
  shortVersion: string;
  systemPrompt: string;
  lastVerified: string;
  version: string;
}

function precomputeLower(entries: FlatEntry[]) {
  return entries.map(e => ({
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
}

const searchCache = new Map<string, string[]>();
const SEARCH_CACHE_MAX = 100;

export function searchEntries(
  query: string,
  allEntries: FlatEntry[],
): FlatEntry[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();

  const cached = searchCache.get(q);
  if (cached !== undefined) {
    const idMap = new Map(allEntries.map(e => [e.id, e]));
    return cached.map(id => idMap.get(id)!).filter(Boolean);
  }

  const lower = precomputeLower(allEntries);
  const qWords = q.split(/\s+/).filter(Boolean);
  const ENOUGH_EXACT = 20;

  const scored: Array<{ entry: FlatEntry; score: number }> = [];

  for (let i = 0; i < allEntries.length; i++) {
    const entry = allEntries[i];
    const lo = lower[i];
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
  searchCache.set(q, result.map(e => e.id));
  return result;
}

export function highlightMatches(text: string, query: string): string {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(
    regex,
    '<mark class="bg-amber-500/20 text-amber-500 rounded-sm px-0.5">$1</mark>',
  );
}

const CHINESE_CATEGORIES = new Set(['image', 'video', '3d']);

export function getDisplayPrompt(
  entry: {
    systemPrompt: string;
    shortVersion: string;
    ecosystem: string;
    category: string;
  },
  type: 'full' | 'short',
  useChinese: boolean,
): string {
  const base = type === 'full' ? entry.systemPrompt : entry.shortVersion;
  if (!useChinese) return base;
  if (entry.ecosystem !== 'chinese') return base;
  if (!CHINESE_CATEGORIES.has(entry.category)) return base;
  return base;
}
