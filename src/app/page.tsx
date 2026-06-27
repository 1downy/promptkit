'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/promptkit/store';

function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
import {
  ALL_ENTRIES,
  getEntryById,
  searchEntries,
  ENTRIES_BY_CATEGORY,
  UNIQUE_PROVIDERS,
  getSourceQuality as getEntryQuality,
  sortEntries,
  highlightMatches,
  getDisplayPrompt,
  SystemPromptEntry,
  ModelCategory,
  SortField,
  SortOrder,
} from '@/lib/promptkit/system-prompts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Zap, Search, Sun, Moon, ChevronRight, Trophy,
  Bookmark, BookmarkCheck, ArrowLeft,
  FileText, Github, AlertCircle,
  Layers, GitCompare, X, Sparkles, Keyboard,
  SlidersHorizontal,
} from 'lucide-react';
import { getArenaRanking, getVideoArenaRanking, getTextArenaRanking, getImageToVideoArenaRanking } from '@/lib/promptkit/arena-ranks';
import type { ArenaRanking } from '@/lib/promptkit/arena-ranks';
import { cn } from '@/lib/utils';
import { CopyButton } from '@/components/ui/copy-button';
import { SourceQualityBadge } from '@/components/ui/source-quality-badge';
import { DetailView, CATEGORY_CONFIG, ALL_CATEGORIES } from '@/components/detail-view';





const ECOSYSTEMS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'western', label: 'Western' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'open-weight', label: 'Open Weight' },
];











function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}







function Header() {
  const { searchOpen, setSearchOpen, compareIds, setActiveView, activeView } = useAppStore();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const el = document.documentElement;
    const checkDark = () => setIsDark(el.classList.contains('dark'));
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const el = document.documentElement;
    if (el.classList.contains('dark')) {
      el.classList.remove('dark');
      el.classList.add('light');
    } else {
      el.classList.remove('light');
      el.classList.add('dark');
    }
    setIsDark(!isDark);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <button
            onClick={() => { setActiveView('browse'); useAppStore.setState({ selectedEntryId: null }); }}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            aria-label="Go to home page"
          >
            <img src="/icon.svg" alt="PromptKit" className="w-8 h-8" />
            <div className="text-left">
              <h1 className="text-lg font-bold tracking-tight leading-none">
                Prompt<span className="text-amber-500">Kit</span>
              </h1>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">System Prompt Library</p>
            </div>
          </button>

          <nav className="flex items-center gap-2" aria-label="Main navigation">
            {compareIds.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveView('compare')}
                className="gap-1.5 text-xs"
                aria-label={`Compare ${compareIds.length} models`}
              >
                <GitCompare className="h-3.5 w-3.5" />
                Compare ({compareIds.length})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setActiveView('bookmarks')} className="gap-1.5 text-xs" aria-label="View saved prompts">
              <Bookmark className="h-3.5 w-3.5" />
              Saved
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => setSearchOpen(true)} className="h-8 w-8 p-0" aria-label="Search models (⌘K)">
                    <Search className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Search <kbd className="ml-1 px-1 py-0.5 bg-muted rounded text-xs">⌘K</kbd></p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-8 w-8 p-0" aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}


function BrowseSkeleton() {
  return <div className="space-y-4"><div className="h-8 rounded-lg bg-muted/30 animate-pulse" /><div className="h-64 rounded-lg bg-muted/30 animate-pulse" /></div>;
}

/** Get arena rank number for an entry (Infinity if unranked). Lower = better. */
function entryRank(entry: SystemPromptEntry): number {
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
      result = result.filter(e => getEntryQuality(e) === sourceQualityFilter);
    }
    if (debouncedSearch) {
      const searched = searchEntries(debouncedSearch);
      const searchedOrder = new Map(searched.map((e, i) => [e.id, i]));
      result = result.filter(e => searchedOrder.has(e.id));
      // Keep relevance order from search; don't re-sort
      return result.sort((a, b) => (searchedOrder.get(a.id) ?? 0) - (searchedOrder.get(b.id) ?? 0));
    }
    if (sortBy === 'ranking') {
      return [...result].sort((a, b) => {
        const rankA = entryRank(a);
        const rankB = entryRank(b);
        if (rankA === rankB) return 0;
        // desc = best rank first (lower rank number)
        // asc = worst rank first (higher rank number)
        return sortOrder === 'desc' ? rankA - rankB : rankB - rankA;
      });
    }
    return sortEntries(result, sortBy, sortOrder);
  }, [debouncedSearch, categoryFilter, ecosystemFilter, providerFilter, sourceQualityFilter, sortBy, sortOrder]);

  // Active filter tags — labels kept short for mobile
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

  return (
    <div className="space-y-6">
      {/* Hero — hide when user is searching */}
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

      {/* Filters */}
      <section className="space-y-3" aria-label="Filter models">
        {/* Category buttons — scrollable on mobile with right-fade indicators */}
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

        {/* Search + Filter row */}
        <div className="flex flex-col gap-3">
          {/* Desktop Filters: hidden on mobile */}
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
            {/* Provider filter */}
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
            {/* Source quality filter */}
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
            {/* Sort */}
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

          {/* Mobile Filters: visible only on mobile / tablet */}
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
                  {/* Ecosystem Filter */}
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

                  {/* Provider Filter */}
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

                  {/* Quality Filter */}
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

                  {/* Sort order */}
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

      {/* Active filter tags */}
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

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {isSearching ? (
            <>Found <span className="font-medium text-foreground">{entries.length}</span> result{entries.length !== 1 ? 's' : ''} for &ldquo;<span className="font-medium">{debouncedSearch}</span>&rdquo;</>
          ) : (
            <>Showing <span className="font-medium text-foreground">{entries.length}</span> of {ALL_ENTRIES.length} models</>
          )}
        </p>
      </div>

      {/* Entries Grid */}
      {entries.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-8 w-8 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">No models found matching your filters.</p>
          <Button variant="link" size="sm" className="mt-2 text-amber-500" onClick={() => { setCategoryFilter('all'); setEcosystemFilter('all'); setProviderFilter('all'); setSourceQualityFilter('all'); setLocalSearch(''); router.replace('/'); }}>
            Clear filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Model entries">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} query={debouncedSearch} />
          ))}
        </div>
      )}
    </div>
  );
}


const EntryCard = React.memo(function EntryCard({ entry, query }: { entry: SystemPromptEntry; query?: string }) {
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
                <SourceQualityBadge entry={entry} />
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

          {/* Short version preview — 3 lines */}
          <div className="bg-muted/30 rounded-lg p-3 mb-3">
            <pre className="text-[11px] font-mono line-clamp-3 whitespace-pre-wrap text-muted-foreground">
              {getDisplayPrompt(entry, 'short', useChinesePrompt)}
            </pre>
          </div>

          {/* Sources summary */}
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">{entry.sources.length} source{entry.sources.length !== 1 ? 's' : ''}</span>
            {entry.sources.slice(0, 2).map((s, i) => (
              <Badge key={i} variant="secondary" className="text-[9px] px-1 py-0">{s.type}</Badge>
            ))}
          </div>
        </Link>

        {/* Actions */}
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







function CompareView() {
  const { compareIds, removeCompare, clearCompare, setActiveView } = useAppStore();
  const useChinesePrompt = useAppStore(s => s.useChinesePrompt);
  const setUseChinesePrompt = useAppStore(s => s.setUseChinesePrompt);
  const [viewMode, setViewMode] = useState<'specs' | 'prompts'>('specs');
  const [promptMode, setPromptMode] = useState<'short' | 'full'>('short');

  const entries = useMemo(() =>
    compareIds.map(id => getEntryById(id)).filter(Boolean) as SystemPromptEntry[],
    [compareIds]
  );

  const comparisonRows = useMemo(() => {
    const build = <T,>(label: string, extract: (e: SystemPromptEntry) => T, fmt?: (v: T) => string) => {
      const values = entries.map(extract);
      const strValues = values.map(v => fmt ? fmt(v) : String(v));
      const differs = new Set(strValues).size > 1;
      return { label, values: strValues, differs };
    };
    return [
      build('Provider', e => e.provider),
      build('Category', e => e.category),
      build('Ecosystem', e => e.ecosystem),
      build('Version', e => e.version),
      build('Last Verified', e => e.lastVerified),
      build('Sources', e => e.sources.length, v => `${v} sources`),
      build('Tips', e => e.tips.length, v => `${v} tips`),
      build('Source Quality', e => getEntryQuality(e)),
    ];
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="text-center py-16">
        <GitCompare className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-4">No models selected for comparison.</p>
        <Button variant="outline" onClick={() => setActiveView('browse')}>Browse Models</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-amber-500" />
          Compare System Prompts
          <Badge variant="secondary">{entries.length} models</Badge>
        </h2>
        <Button variant="ghost" size="sm" onClick={clearCompare} className="text-destructive">
          <X className="h-4 w-4 mr-1" />Clear All
        </Button>
      </div>

      {/* Tab Toggle */}
      <div className="flex items-center gap-1 border-b border-border">
        <button
          onClick={() => setViewMode('specs')}
          className={cn(
            'px-3 py-2 text-sm font-medium transition-colors relative',
            viewMode === 'specs'
              ? 'text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Layers className="h-3.5 w-3.5 inline mr-1.5" />
          Specs
        </button>
        <button
          onClick={() => setViewMode('prompts')}
          className={cn(
            'px-3 py-2 text-sm font-medium transition-colors relative',
            viewMode === 'prompts'
              ? 'text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <FileText className="h-3.5 w-3.5 inline mr-1.5" />
          Prompts
        </button>
      </div>

      {/* ===== SPECS TABLE ===== */}
      {viewMode === 'specs' && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <div
            className="min-w-[500px]"
            style={{ display: 'grid', gridTemplateColumns: `140px repeat(${entries.length}, 1fr)` }}
          >
            {/* Header Row */}
            <div className="px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-background border-b border-border sticky left-0 z-20 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] border-r">
              Attribute
            </div>
            {entries.map(e => (
              <div key={e.id} className="px-4 py-2 text-sm font-medium bg-muted/30 border-b border-border flex items-center gap-2 justify-between">
                <span className="truncate">{e.modelName}</span>
                <button
                  onClick={() => removeCompare(e.id)}
                  className="h-5 w-5 shrink-0 rounded hover:bg-muted-foreground/10 flex items-center justify-center transition-colors"
                  aria-label={`Remove ${e.modelName}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* Data Rows */}
            {comparisonRows.map(row => (
              <React.Fragment key={row.label}>
                <div className={cn(
                  'px-4 py-2.5 text-xs font-medium flex items-center gap-1.5 border-b border-border border-l-2 sticky left-0 z-10 bg-background shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] border-r',
                  row.differs
                    ? 'border-l-amber-500 bg-amber-500/[0.06] text-foreground'
                    : 'border-l-transparent text-muted-foreground'
                )}>
                  {row.differs && <AlertCircle className="h-3 w-3 shrink-0 text-amber-600" />}
                  {row.label}
                </div>
                {entries.map((entry, vi) => {
                  const isQuality = row.label === 'Source Quality';
                  const isCategory = row.label === 'Category';
                  const isEcosystem = row.label === 'Ecosystem';
                  return (
                    <div key={entry.id} className={cn(
                      'px-4 py-2.5 text-sm border-b border-border border-l-2 flex items-center',
                      row.differs
                        ? 'border-l-amber-500 bg-amber-500/[0.06]'
                        : 'border-l-transparent'
                    )}>
                      {isQuality ? (
                        <SourceQualityBadge entry={entry} />
                      ) : isCategory ? (
                        <Badge variant="outline" className="text-[10px]">{entry.category}</Badge>
                      ) : isEcosystem ? (
                        <Badge variant="secondary" className="text-[10px]">
                          {entry.ecosystem === 'western' ? 'Western' : entry.ecosystem === 'chinese' ? 'Chinese' : 'Open Weight'}
                        </Badge>
                      ) : (
                        row.values[vi]
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* ===== PROMPTS VIEW ===== */}
      {viewMode === 'prompts' && (
        <div className="space-y-4">
          {/* Toggle: short / full */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setPromptMode('short')}
              className={cn(
                'px-3 py-1.5 text-xs rounded-md font-medium transition-colors',
                promptMode === 'short'
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              Short Version
            </button>
            <button
              onClick={() => setPromptMode('full')}
              className={cn(
                'px-3 py-1.5 text-xs rounded-md font-medium transition-colors',
                promptMode === 'full'
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              Full System Prompt
            </button>
            {entries.every(e => e.ecosystem === 'chinese' && ['image', 'video', '3d'].includes(e.category)) && (
              <>
                <span className="text-xs text-muted-foreground mx-1">|</span>
                <button
                  onClick={() => setUseChinesePrompt(!useChinesePrompt)}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-md font-medium transition-colors',
                    useChinesePrompt
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  {useChinesePrompt ? '中文' : 'English'}
                </button>
              </>
            )}
          </div>

          {/* Prompt Columns */}
          <div className={cn(
            'grid gap-4',
            entries.length === 1 && 'grid-cols-1',
            entries.length === 2 && 'grid-cols-1 md:grid-cols-2',
            entries.length === 3 && 'grid-cols-1 md:grid-cols-3',
            entries.length >= 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
          )}>
            {entries.map(entry => {
              const text = getDisplayPrompt(entry, promptMode, useChinesePrompt);
              return (
                <Card key={entry.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{entry.modelName}</CardTitle>
                      <div className="flex items-center gap-2">
                        <SourceQualityBadge entry={entry} />
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeCompare(entry.id)} aria-label={`Remove ${entry.modelName} from comparison`}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-[11px]">{entry.provider} &bull; {entry.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-3">
                    <div className="flex-1 max-h-[500px] overflow-y-auto">
                      <pre className="text-[11px] font-mono whitespace-pre-wrap bg-muted/30 rounded-lg p-3">
                        {text}
                      </pre>
                    </div>
                    <CopyButton text={text} label={`Copy ${promptMode === 'short' ? 'Short' : 'Full'}`} className="w-full h-7 text-xs" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


function BookmarksView() {
  const { bookmarks, removeBookmark } = useAppStore();
  const useChinesePrompt = useAppStore(s => s.useChinesePrompt);
  const entries = useMemo(() =>
    bookmarks.map(b => ({ ...b, entry: getEntryById(b.entryId) })).filter(b => b.entry),
    [bookmarks]
  );

  if (entries.length === 0) {
    return (
      <div className="text-center py-16">
        <Bookmark className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-1">No bookmarked system prompts yet.</p>
        <p className="text-xs text-muted-foreground">Click the bookmark icon on any model to save it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Bookmark className="h-5 w-5 text-amber-500" />
        Saved System Prompts
        <Badge variant="secondary">{entries.length}</Badge>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries.map(({ entry, ...b }) => (
          <Card key={b.id} className="hover:border-amber-500/20 transition-all">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Link href={`/model/${entry!.id}`} className="font-semibold truncate hover:text-amber-500 transition-colors">{entry!.modelName}</Link>
                    <SourceQualityBadge entry={entry!} />
                  </div>
                  <p className="text-xs text-muted-foreground">{entry!.provider}</p>
                </div>
                <Badge variant="outline" className="text-[9px] shrink-0 ml-2">{entry!.category.toUpperCase()}</Badge>
              </div>
              <pre className="text-[11px] font-mono line-clamp-4 whitespace-pre-wrap bg-muted/30 rounded-lg p-3 mb-3">
                {getDisplayPrompt(entry!, 'short', useChinesePrompt).slice(0, 200)}...
              </pre>
              <div className="flex gap-2">
                <CopyButton text={getDisplayPrompt(entry!, b.type === 'short' ? 'short' : 'full', useChinesePrompt)} label="Copy" className="flex-1 h-7 text-xs" />
                <Button variant="ghost" size="sm" className="h-7 text-destructive" onClick={() => removeBookmark(b.entryId)} aria-label={`Remove ${entry!.modelName} from saved`}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


function SearchDialog() {
  const { searchOpen, setSearchOpen, setSelectedEntryId, setCategoryFilter, setActiveView } = useAppStore();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce: update query state 150ms after user stops typing
  const handleQueryChange = useCallback((val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(val), 150);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const clearQuery = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const results = useMemo(() => debouncedQuery ? searchEntries(debouncedQuery) : [], [debouncedQuery]);

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="sm:max-w-lg p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Search Models</DialogTitle>
        </DialogHeader>
        <Command className="border-0" shouldFilter={false}>
          <CommandInput
            placeholder="Search models, providers, categories..."
            value={query}
            onValueChange={handleQueryChange}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {results.length > 0 && (
              <CommandGroup heading={`Models (${results.length})`}>
                {results.slice(0, 50).map((e) => (
                  <CommandItem
                    key={e.id}
                    value={e.id}
                    onSelect={() => {
                      setSearchOpen(false);
                      router.push(`/model/${e.id}`);
                    }}
                  >
                    <Badge variant="outline" className="text-[9px] mr-2 shrink-0">{e.category}</Badge>
                    <span className="truncate" dangerouslySetInnerHTML={{ __html: highlightMatches(e.modelName, query) }} />
                    <span className="text-xs text-muted-foreground ml-auto shrink-0">{e.provider}</span>
                    <SourceQualityBadge entry={e} />
                  </CommandItem>
                ))}
                {results.length > 50 && (
                  <CommandItem
                    value="__view_all__"
                    onSelect={() => {
                      setSearchOpen(false);
                      clearQuery();
                      setCategoryFilter('all');
                      setActiveView('browse');
                    }}
                    className="text-amber-500 text-xs justify-center"
                  >
                    View all {results.length} results in browse mode
                  </CommandItem>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}


function useKeyboardShortcuts() {
  const { setSearchOpen } = useAppStore();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSearchOpen]);
}


export default function Home() {
  const { activeView } = useAppStore();
  useKeyboardShortcuts();

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6" role="main">
          {/* Keep BrowseView mounted but hidden to avoid remounting 400+ EntryCards on navigation — freeze fix */}
          <div className={cn(activeView !== 'browse' && 'hidden')}>
            <Suspense fallback={<BrowseSkeleton />}>
              <BrowseView />
            </Suspense>
          </div>
          {activeView === 'detail' && <DetailView />}
          {activeView === 'compare' && <CompareView />}
          {activeView === 'bookmarks' && <BookmarksView />}
        </main>

        <footer className="border-t border-border bg-background/80 backdrop-blur-xl" role="contentinfo">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <Zap className="h-3 w-3 text-amber-500" />
                <span className="font-medium">PromptKit</span>
                <span className="opacity-50">&bull;</span>
                <span>{ALL_ENTRIES.length} system prompts</span>
                <span className="opacity-50">&bull;</span>
                <span>Based on official docs &amp; whitepapers</span>
                <span className="opacity-50">&bull;</span>
                <a href="https://github.com/1downy/promptkit" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors inline-flex items-center gap-1">
                  <Github className="h-3 w-3" /> Source
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex items-center gap-1">
                  <Keyboard className="h-3 w-3" />
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">⌘K</kbd> Search
                </span>
                <span className="hidden sm:inline-flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">⌘B</kbd> Bookmarks
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Esc</kbd> Back
                </span>
              </div>
            </div>
          </div>
        </footer>

        <SearchDialog />
      </div>
    </TooltipProvider>
  );
}
