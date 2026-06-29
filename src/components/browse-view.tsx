'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FlatEntry, SortField, SortOrder } from '@/lib/promptkit/prompt-utils';
import { getSourceQuality, sortEntries, searchEntries, highlightMatches, getDisplayPrompt } from '@/lib/promptkit/prompt-utils';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/promptkit/store';
import type { SystemPromptEntry, ModelCategory } from '@/lib/promptkit/system-prompts';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Zap, Search, ChevronRight, Trophy,
  Bookmark, BookmarkCheck, ArrowLeft,
  FileText, AlertCircle,
  Layers, GitCompare, X, Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { getArenaRanking, getVideoArenaRanking, getTextArenaRanking, getImageToVideoArenaRanking } from '@/lib/promptkit/arena-ranks';
import type { ArenaRanking } from '@/lib/promptkit/arena-ranks';
import { cn } from '@/lib/utils';
import { CopyButton } from '@/components/ui/copy-button';
import { SourceQualityBadge } from '@/components/ui/source-quality-badge';
import { CATEGORY_CONFIG, ALL_CATEGORIES } from '@/components/detail-view';

const ECOSYSTEMS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'western', label: 'Western' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'open-weight', label: 'Open Weight' },
];

interface DataPayload {
  entries: FlatEntry[];
  byCategory: Record<string, FlatEntry[]>;
  providers: string[];
}

function useData(): DataPayload | null {
  const [data, setData] = useState<DataPayload | null>(null);
  useEffect(() => {
    fetch('/data.json')
      .then(r => r.json())
      .then(setData);
  }, []);
  return data;
}

function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

function entryRank(entry: FlatEntry): number {
  const isVideo = entry.category === 'video';
  const isImage = entry.category === 'image' || entry.category === 'design';
  const isText = entry.category === 'text';
  const ranking = isVideo
    ? getVideoArenaRanking(entry.modelName) ?? getImageToVideoArenaRanking(entry.modelName)
    : isImage
    ? getArenaRanking(entry.modelName)
    : isText
    ? getTextArenaRanking(entry.modelName)
    : null;
  return ranking?.rank ?? Infinity;
}

function BrowseView() {
  const data = useData();
  if (!data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-16 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return <BrowseViewInner data={data} />;
}

function BrowseViewInner({ data: { entries: ALL_ENTRIES, byCategory: ENTRIES_BY_CATEGORY, providers: UNIQUE_PROVIDERS } }: { data: DataPayload }) {

  const {
    categoryFilter, setCategoryFilter,
    ecosystemFilter, setEcosystemFilter,
    providerFilter, setProviderFilter,
    sourceQualityFilter, setSourceQualityFilter,
    searchQuery, setSearchQuery,
    sortBy, setSortBy,
    sortOrder, setSortOrder,
    setSelectedEntryId,
  } = useAppStore();
  const router = useRouter();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 300);

  const PAGE_SIZE = 30;
  const [loadedCount, setLoadedCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoadedCount(PAGE_SIZE);
  }, [debouncedSearch, categoryFilter, ecosystemFilter, providerFilter, sourceQualityFilter, sortBy, sortOrder]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadedCount(prev => prev + PAGE_SIZE);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const searchParams = useSearchParams();

  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);

  useEffect(() => {
    const provider = searchParams.get('provider');
    if (provider) setProviderFilter(provider);
    const category = searchParams.get('category');
    if (category) setCategoryFilter(category);
  }, [searchParams, setProviderFilter, setCategoryFilter]);

  const providers = UNIQUE_PROVIDERS;
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: ALL_ENTRIES.length };
    for (const cat of ALL_CATEGORIES) counts[cat] = ENTRIES_BY_CATEGORY[cat]?.length ?? 0;
    return counts;
  }, []);

  const entries = useMemo(() => {
    let result = ALL_ENTRIES;

    if (categoryFilter !== 'all') {
      result = result.filter(e => e.category === categoryFilter);
    }
    if (ecosystemFilter !== 'all') {
      result = result.filter(e => e.ecosystem === ecosystemFilter);
    }
    if (providerFilter !== 'all') {
      result = result.filter(e => e.provider === providerFilter);
    }
    if (sourceQualityFilter !== 'all') {
      result = result.filter(e => getSourceQuality(e) === sourceQualityFilter);
    }
    if (debouncedSearch) {
      const searched = searchEntries(debouncedSearch, ALL_ENTRIES);
      const searchedOrder = new Map(searched.map((e, i) => [e.id, i]));
      result = result.filter(e => searchedOrder.has(e.id));
      return result.sort((a, b) => (searchedOrder.get(a.id) ?? 0) - (searchedOrder.get(b.id) ?? 0));
    }
    if (sortBy === 'ranking') {
      return [...result].sort((a, b) => {
        const rankA = entryRank(a);
        const rankB = entryRank(b);
        if (rankA === rankB) return 0;
        return sortOrder === 'desc' ? rankA - rankB : rankB - rankA;
      });
    }
    return sortEntries(result, sortBy, sortOrder);
  }, [debouncedSearch, categoryFilter, ecosystemFilter, providerFilter, sourceQualityFilter, sortBy, sortOrder]);

  const activeFilters: Array<{ key: string; label: string; onClear: () => void }> = [];
  if (categoryFilter !== 'all') {
    const catLabel = CATEGORY_CONFIG[categoryFilter as ModelCategory]?.label ?? categoryFilter;
    activeFilters.push({ key: 'cat', label: catLabel, onClear: () => setCategoryFilter('all') });
  }
  if (ecosystemFilter !== 'all') {
    const ecoLabel = ECOSYSTEMS.find(e => e.value === ecosystemFilter)?.label ?? ecosystemFilter;
    activeFilters.push({ key: 'eco', label: ecoLabel, onClear: () => setEcosystemFilter('all') });
  }
  if (providerFilter !== 'all') {
    activeFilters.push({ key: 'prov', label: providerFilter, onClear: () => setProviderFilter('all') });
  }
  if (sourceQualityFilter !== 'all') {
    const qualLabel = sourceQualityFilter.charAt(0).toUpperCase() + sourceQualityFilter.slice(1);
    activeFilters.push({ key: 'qual', label: qualLabel, onClear: () => setSourceQualityFilter('all') });
  }

  const hasActiveFilters = activeFilters.length > 0;
  const isSearching = !!debouncedSearch;
  const visibleCount = Math.min(loadedCount, entries.length);
  const hasMore = visibleCount < entries.length;

  return (
    <div className="space-y-6">
      {!isSearching && (
        <section className="relative overflow-hidden text-center py-10 px-6 rounded-2xl border border-border bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent" aria-labelledby="hero-heading">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/10 blur-3xl rounded-full -z-10" />
          <h2 id="hero-heading" className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-foreground via-foreground/90 to-amber-500 bg-clip-text text-transparent">
            The Best System Prompts for Every AI Model
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Copy the expert-crafted system prompt for your target model. Paste it into ChatGPT, Claude, or any chatbot. Then ask it to generate prompts following those rules.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-5 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-amber-500" /> 400+ models</span>
            <span className="flex items-center gap-1.5"><ArrowLeft className="h-3.5 w-3.5 rotate-180 text-amber-500" /> Paste in your chatbot</span>
            <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-amber-500" /> Get optimized prompts</span>
          </div>
        </section>
      )}

      <section className="space-y-3" aria-label="Filter models">
        <div className="relative">
          <div
            className="flex gap-1.5 overflow-x-auto md:flex-wrap [-webkit-overflow-scrolling:touch] snap-x snap-mandatory mask-grad-r md:[mask-image:none] md:[-webkit-mask-image:none] pb-1 custom-scrollbar"
            role="group"
            aria-label="Category filter"
          >
            <button
              onClick={() => setCategoryFilter('all')}
              className={cn(
                'snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer shrink-0',
                categoryFilter === 'all'
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-500 font-semibold'
                  : 'border-border hover:border-amber-500/30 text-muted-foreground'
              )}
              aria-pressed={categoryFilter === 'all'}
            >
              <Layers className="h-3.5 w-3.5" />
              All
              <span className={cn(
                'ml-0.5 px-1.5 py-0 rounded-full text-[10px]',
                categoryFilter === 'all' ? 'bg-amber-500/20' : 'bg-muted'
              )}>
                {categoryCounts.all}
              </span>
            </button>
            {ALL_CATEGORIES.map((cat) => {
              const config = CATEGORY_CONFIG[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    'snap-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer shrink-0',
                    categoryFilter === cat
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-500 font-semibold'
                      : 'border-border hover:border-amber-500/30 text-muted-foreground'
                  )}
                  aria-pressed={categoryFilter === cat}
                >
                  {config.icon}
                  {config.label}
                  <span className={cn(
                    'ml-0.5 px-1.5 py-0 rounded-full text-[10px]',
                    categoryFilter === cat ? 'bg-amber-500/20' : 'bg-muted'
                  )}>
                    {categoryCounts[cat] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="hidden md:flex flex-row gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Search models, providers, categories..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="h-8 text-sm pr-8"
                aria-label="Search models"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex gap-1 shrink-0 flex-wrap items-center" role="group" aria-label="Ecosystem filter">
              {ECOSYSTEMS.map((eco) => (
                <button
                  key={eco.value}
                  onClick={() => setEcosystemFilter(eco.value)}
                  className={cn(
                    'px-2.5 py-1.5 rounded-md text-xs font-medium transition-all border cursor-pointer',
                    ecosystemFilter === eco.value
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-500'
                      : 'border-border hover:border-amber-500/30 text-muted-foreground'
                  )}
                  aria-pressed={ecosystemFilter === eco.value}
                >
                  {eco.label}
                </button>
              ))}
            </div>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="h-8 text-xs w-[140px]">
                <SelectValue placeholder="All Providers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {providers.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sourceQualityFilter} onValueChange={setSourceQualityFilter}>
              <SelectTrigger className="h-8 text-xs w-[120px]">
                <SelectValue placeholder="All Qualities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Qualities</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="limited">Limited Docs</SelectItem>
              </SelectContent>
            </Select>
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => {
              const [f, o] = v.split('-') as [SortField, SortOrder];
              setSortBy(f);
              setSortOrder(o);
            }}>
              <SelectTrigger className="h-8 text-xs w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ranking-desc">Top Ranked</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
                <SelectItem value="provider-asc">Provider A-Z</SelectItem>
                <SelectItem value="quality-desc">Best Quality</SelectItem>
                <SelectItem value="date-desc">Latest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex md:hidden gap-2 w-full">
            <div className="relative flex-1">
              <Input
                placeholder="Search models..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="h-8 text-sm pr-8"
                aria-label="Search models"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs relative cursor-pointer">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                  {activeFilters.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">
                      {activeFilters.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] p-6 flex flex-col gap-6 overflow-y-auto">
                <SheetHeader className="px-0 pb-4 border-b border-border text-left">
                  <SheetTitle>Filter Models</SheetTitle>
                  <SheetDescription>Refine models by ecosystem, provider, quality, and sort order.</SheetDescription>
                </SheetHeader>

                <div className="flex-1 flex flex-col gap-5 py-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ecosystem</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {ECOSYSTEMS.map((eco) => (
                        <button
                          key={eco.value}
                          onClick={() => setEcosystemFilter(eco.value)}
                          className={cn(
                            'px-2.5 py-1.5 rounded-md text-xs font-medium transition-all border cursor-pointer',
                            ecosystemFilter === eco.value
                              ? 'border-amber-500/50 bg-amber-500/10 text-amber-500'
                              : 'border-border hover:border-amber-500/30 text-muted-foreground'
                          )}
                        >
                          {eco.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 flex flex-col">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Provider</Label>
                    <Select value={providerFilter} onValueChange={setProviderFilter}>
                      <SelectTrigger className="h-9 text-xs w-full">
                        <SelectValue placeholder="All Providers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Providers</SelectItem>
                        {providers.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 flex flex-col">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source Quality</Label>
                    <Select value={sourceQualityFilter} onValueChange={setSourceQualityFilter}>
                      <SelectTrigger className="h-9 text-xs w-full">
                        <SelectValue placeholder="All Qualities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Qualities</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="limited">Limited Docs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 flex flex-col">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sort By</Label>
                    <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => {
                      const [f, o] = v.split('-') as [SortField, SortOrder];
                      setSortBy(f);
                      setSortOrder(o);
                    }}>
                      <SelectTrigger className="h-9 text-xs w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ranking-desc">Top Ranked</SelectItem>
                        <SelectItem value="name-asc">Name A-Z</SelectItem>
                        <SelectItem value="name-desc">Name Z-A</SelectItem>
                        <SelectItem value="provider-asc">Provider A-Z</SelectItem>
                        <SelectItem value="quality-desc">Best Quality</SelectItem>
                        <SelectItem value="date-desc">Latest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <SheetFooter className="px-0 pt-4 border-t border-border flex flex-row items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    onClick={() => {
                      setEcosystemFilter('all');
                      setProviderFilter('all');
                      setSourceQualityFilter('all');
                      setSortBy('ranking');
                      setSortOrder('desc');
                    }}
                  >
                    Reset All
                  </Button>
                  <SheetClose asChild>
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white cursor-pointer">
                      Apply Filters
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </section>

      {hasActiveFilters && (
        <div className="flex items-center gap-1.5 overflow-x-auto [-webkit-overflow-scrolling:touch]">
          {activeFilters.map(f => (
            <Badge
              key={f.key}
              variant="secondary"
              className="gap-1 text-[10px] py-0.5 px-1.5 whitespace-nowrap shrink-0"
            >
              {f.label}
              <button onClick={f.onClear} className="hover:text-destructive ml-0.5" aria-label={`Clear ${f.label}`}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <button
            onClick={() => { setCategoryFilter('all'); setEcosystemFilter('all'); setProviderFilter('all'); setSourceQualityFilter('all'); router.replace('/'); }}
            className="text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2 whitespace-nowrap shrink-0"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {isSearching ? (
            <>Found <span className="font-medium text-foreground">{entries.length}</span> result{entries.length !== 1 ? 's' : ''} for &ldquo;<span className="font-medium">{debouncedSearch}</span>&rdquo;</>
          ) : (
            <>Showing <span className="font-medium text-foreground">{visibleCount}</span> of {ALL_ENTRIES.length} models</>
          )}
        </p>
      </div>

      {entries.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-8 w-8 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">No models found matching your filters.</p>
          <Button variant="link" size="sm" className="mt-2 text-amber-500" onClick={() => { setCategoryFilter('all'); setEcosystemFilter('all'); setProviderFilter('all'); setSourceQualityFilter('all'); setLocalSearch(''); router.replace('/'); }}>
            Clear filters
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Model entries">
            {entries.slice(0, visibleCount).map((entry) => (
              <EntryCard key={entry.id} entry={entry} query={debouncedSearch} getEntryQuality={getSourceQuality} highlightMatches={highlightMatches} getDisplayPrompt={getDisplayPrompt} />
            ))}
          </div>
          <div
            ref={sentinelRef}
            className={hasMore ? 'w-full py-8 flex items-center justify-center' : 'hidden'}
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Loading more models...</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const EntryCard = React.memo(function EntryCard({ entry, query, getEntryQuality, highlightMatches, getDisplayPrompt }: {
  entry: FlatEntry; query?: string;
  getEntryQuality: (e: FlatEntry) => string;
  highlightMatches: (text: string, query: string) => string;
  getDisplayPrompt: (entry: { systemPrompt: string; shortVersion: string; ecosystem: string; category: string }, type: 'full' | 'short', useChinese: boolean) => string;
}) {
  const setSelectedEntryId = useAppStore(s => s.setSelectedEntryId);
  const addCompare = useAppStore(s => s.addCompare);
  const removeCompare = useAppStore(s => s.removeCompare);
  const addBookmark = useAppStore(s => s.addBookmark);
  const removeBookmark = useAppStore(s => s.removeBookmark);
  const hydrated = useHydrated();
  const isComparing = useAppStore(s => s.compareIds.includes(entry.id));
  const bookmarked = useAppStore(s => hydrated && s.bookmarks.some(b => b.entryId === entry.id));
  const catConfig = CATEGORY_CONFIG[entry.category];
  const quality = getEntryQuality(entry);
  const qualityHoverBorder = quality === 'verified' ? 'hover:border-emerald-500/50'
    : quality === 'partial' ? 'hover:border-amber-500/50'
    : 'hover:border-red-500/50';

  const useChinesePrompt = useAppStore(s => s.useChinesePrompt);

  const rankings = useMemo(() => {
    const result: { ranking: ArenaRanking; label: string }[] = [];
    if (entry.category === 'video') {
      const t2v = getVideoArenaRanking(entry.modelName);
      const i2v = getImageToVideoArenaRanking(entry.modelName);
      if (t2v) result.push({ ranking: t2v, label: 'T2V' });
      if (i2v) result.push({ ranking: i2v, label: 'I2V' });
    } else if (entry.category === 'image' || entry.category === 'design') {
      const r = getArenaRanking(entry.modelName);
      if (r) result.push({ ranking: r, label: 'T2I' });
    } else if (entry.category === 'text') {
      const r = getTextArenaRanking(entry.modelName);
      if (r) result.push({ ranking: r, label: 'Chat' });
    }
    return result;
  }, [entry.category, entry.modelName]);

  const highlight = useCallback((text: string) => {
    if (!query) return text;
    return highlightMatches(text, query);
  }, [query]);

  return (
    <Card
      className={cn("group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/[0.03] cursor-pointer hover-glow", qualityHoverBorder)}
      role="listitem"
    >
      <CardContent className="pt-5">
        <Link href={`/model/${entry.id}`} className="block">
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-base truncate" dangerouslySetInnerHTML={{ __html: query ? highlight(entry.modelName) : entry.modelName }} />
                <SourceQualityBadge entry={entry as SystemPromptEntry} />
              </div>
              <span
                className="text-xs text-muted-foreground hover:text-amber-500 transition-colors"
                aria-label={`Filter by ${entry.provider}`}
              >
                {entry.provider}
              </span>
            </div>
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 gap-0.5 shrink-0 ml-2">
              {catConfig.icon}
              {entry.category.toUpperCase()}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            {rankings.map(({ ranking: r, label }) => (
              <Badge key={label} variant="outline" className="text-[9px] px-1.5 py-0 gap-0.5 border-purple-500/30 text-purple-400">
                <Trophy className="h-2.5 w-2.5" />
                #{r.rank}
                <span className="text-purple-400/60 ml-0.5">{label}</span>
                {r.preliminary && <span className="text-amber-500 ml-0.5">*</span>}
              </Badge>
            ))}
            <Badge className={cn(
              'text-[9px] px-1.5 py-0',
              entry.ecosystem === 'chinese' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
              entry.ecosystem === 'open-weight' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
              'bg-blue-500/10 text-blue-500 border-blue-500/20'
            )} variant="outline">
              {entry.ecosystem === 'chinese' ? 'CN' : entry.ecosystem === 'open-weight' ? 'Open' : 'Com'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3" dangerouslySetInnerHTML={{ __html: query ? highlight(entry.description) : entry.description }} />

          <div className="bg-muted/30 rounded-lg p-3 mb-3">
            <pre className="text-[11px] font-mono line-clamp-3 whitespace-pre-wrap text-muted-foreground">
              {getDisplayPrompt(entry, 'short', useChinesePrompt)}
            </pre>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">{entry.sources.length} source{entry.sources.length !== 1 ? 's' : ''}</span>
            {entry.sources.slice(0, 2).map((s, i) => (
              <Badge key={i} variant="secondary" className="text-[9px] px-1 py-0">{s.type}</Badge>
            ))}
          </div>
        </Link>

        <div className="flex items-center gap-1.5 pt-2 border-t border-border">
          <CopyButton text={getDisplayPrompt(entry, 'full', useChinesePrompt)} label="Copy" className="flex-1 h-7 text-xs" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn('h-7 w-7 p-0', bookmarked ? 'text-amber-500' : '')}
                onClick={(e) => { e.stopPropagation(); if (bookmarked) { removeBookmark(entry.id); } else { addBookmark(entry.id, 'full'); } }}
                aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this model'}
              >
                {bookmarked ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{bookmarked ? 'Remove bookmark' : 'Bookmark'}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn('h-7 w-7 p-0', isComparing ? 'text-blue-500' : '')}
                onClick={(e) => { e.stopPropagation(); if (isComparing) { removeCompare(entry.id); } else { addCompare(entry.id); } }}
                aria-label={isComparing ? 'Remove from compare' : 'Add to compare'}
              >
                <GitCompare className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isComparing ? 'Remove from compare' : 'Add to compare'}</TooltipContent>
          </Tooltip>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
        </div>
      </CardContent>
    </Card>
  );
});

export default BrowseView;
