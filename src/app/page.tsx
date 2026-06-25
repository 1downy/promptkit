'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '@/lib/promptkit/store';
import {
  ALL_ENTRIES,
  getEntryById,
  searchEntries,
  ENTRIES_BY_CATEGORY,
  getUniqueProviders,
  getSourceQuality as getEntryQuality,
  sortEntries,
  highlightMatches,
  SystemPromptEntry,
  SourceRef,
  ModelCategory,
  SortField,
  SortOrder,
} from '@/lib/promptkit/system-prompts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Zap, Copy, Check, Search, Sun, Moon, ChevronRight,
  Bookmark, BookmarkCheck, ArrowLeft, ExternalLink,
  FileText, BookOpen, Github, Globe, AlertCircle,
  Layers, GitCompare, X, Sparkles, Shield,
  Eye, Code2, Users, Box, Video, ImageIcon, Type,
  ShieldCheck, ShieldAlert, ShieldQuestion, Keyboard,
  MessageSquare, ChevronDown, Music, PenTool, Link, Globe2,
} from 'lucide-react';
import { cn } from '@/lib/utils';



const CATEGORY_CONFIG: Record<ModelCategory, { label: string; icon: React.ReactNode }> = {
  text:      { label: 'Text',      icon: <Type className="h-3.5 w-3.5" /> },
  image:     { label: 'Image',     icon: <ImageIcon className="h-3.5 w-3.5" /> },
  video:     { label: 'Video',     icon: <Video className="h-3.5 w-3.5" /> },
  code:      { label: 'Code',      icon: <Code2 className="h-3.5 w-3.5" /> },
  vision:    { label: 'Vision',    icon: <Eye className="h-3.5 w-3.5" /> },
  character: { label: 'Character', icon: <Users className="h-3.5 w-3.5" /> },
  '3d':      { label: '3D',        icon: <Box className="h-3.5 w-3.5" /> },
  audio:     { label: 'Audio',     icon: <Music className="h-3.5 w-3.5" /> },
  design:    { label: 'Design',    icon: <PenTool className="h-3.5 w-3.5" /> },
  embedding: { label: 'Embedding', icon: <Link className="h-3.5 w-3.5" /> },
  moderation:{ label: 'Moderation', icon: <ShieldAlert className="h-3.5 w-3.5" /> },
  world:     { label: 'World',     icon: <Globe2 className="h-3.5 w-3.5" /> },
};

const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG) as ModelCategory[];

const ECOSYSTEMS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'western', label: 'Western' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'open-weight', label: 'Open Weight' },
];



interface ChatPlatform {
  id: string;
  name: string;
  url: string;
  providers: string[];
}

const CHAT_PLATFORMS: ChatPlatform[] = [
  { id: 'chatgpt',    name: 'ChatGPT',      url: 'https://chatgpt.com/#?q=',              providers: ['openai'] },
  { id: 'claude',     name: 'Claude',       url: 'https://claude.ai/new?q=',              providers: ['anthropic'] },
  { id: 'grok',       name: 'Grok',         url: 'https://grok.com/?q=',                  providers: ['xai'] },
  { id: 'perplexity', name: 'Perplexity',   url: 'https://perplexity.ai/?q=',             providers: [] },
  { id: 'huggingchat', name: 'HuggingChat', url: 'https://huggingface.co/chat?q=',        providers: [] },
];

function getChatPlatform(provider: string): ChatPlatform {
  const p = provider.toLowerCase();
  return CHAT_PLATFORMS.find((cp) => cp.providers.includes(p)) ?? CHAT_PLATFORMS[0];
}

const SOURCE_ICONS: Record<SourceRef['type'], React.ReactNode> = {
  docs: <BookOpen className="h-3.5 w-3.5" />,
  whitepaper: <FileText className="h-3.5 w-3.5" />,
  blog: <Globe className="h-3.5 w-3.5" />,
  github: <Github className="h-3.5 w-3.5" />,
  'model-card': <Shield className="h-3.5 w-3.5" />,
  guide: <BookOpen className="h-3.5 w-3.5" />,
  'api-reference': <FileText className="h-3.5 w-3.5" />,
  news: <Globe className="h-3.5 w-3.5" />,
  analysis: <FileText className="h-3.5 w-3.5" />,
  'release-notes': <FileText className="h-3.5 w-3.5" />,
};


function SourceQualityBadge({ entry, size = 'sm' }: { entry: SystemPromptEntry; size?: 'sm' | 'lg' }) {
  const quality = getEntryQuality(entry);
  const isSm = size === 'sm';

  const config: Record<'verified' | 'partial' | 'limited', { label: string; icon: React.ReactNode; className: string }> = {
    verified: {
      label: 'Verified',
      icon: <ShieldCheck className={isSm ? 'h-3 w-3' : 'h-3.5 w-3.5'} />,
      className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    },
    partial: {
      label: 'Partial',
      icon: <ShieldAlert className={isSm ? 'h-3 w-3' : 'h-3.5 w-3.5'} />,
      className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    },
    limited: {
      label: 'Limited Docs',
      icon: <ShieldQuestion className={isSm ? 'h-3 w-3' : 'h-3.5 w-3.5'} />,
      className: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
  };

  const c = config[quality];
  return (
    <Badge variant="outline" className={cn('gap-1 font-medium', c.className, isSm ? 'text-[9px] px-1.5 py-0' : 'text-[10px] px-2 py-0.5')}>
      {c.icon}
      {c.label}
    </Badge>
  );
}


function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}


function CopyButton({ text, label = 'Copy', className }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);
  return (
    <Button
      variant={copied ? 'default' : 'outline'}
      size="sm"
      onClick={handleCopy}
      className={cn(
        copied && 'bg-green-600 hover:bg-green-700 text-white',
        className
      )}
    >
      {copied ? <><Check className="h-3.5 w-3.5 mr-1.5" />Copied!</> : <><Copy className="h-3.5 w-3.5 mr-1.5" />{label}</>}
    </Button>
  );
}


function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'PromptKit',
    description: 'Expert-crafted system prompts for 380+ AI models across 45+ providers. Copy the system prompt for your target model, paste it into ChatGPT or Claude, and get optimized prompts. Based on official docs, whitepapers, and guides.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '120',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
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

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch, setSearchQuery]);

  const providers = useMemo(() => getUniqueProviders(), []);
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
    return sortEntries(result, sortBy, sortOrder);
  }, [debouncedSearch, categoryFilter, ecosystemFilter, providerFilter, sourceQualityFilter, sortBy, sortOrder]);

  // Active filter badges
  const activeFilters: Array<{ key: string; label: string; onClear: () => void }> = [];
  if (categoryFilter !== 'all') {
    const catLabel = CATEGORY_CONFIG[categoryFilter as ModelCategory]?.label ?? categoryFilter;
    activeFilters.push({ key: 'cat', label: `Category: ${catLabel}`, onClear: () => setCategoryFilter('all') });
  }
  if (ecosystemFilter !== 'all') {
    const ecoLabel = ECOSYSTEMS.find(e => e.value === ecosystemFilter)?.label ?? ecosystemFilter;
    activeFilters.push({ key: 'eco', label: `Ecosystem: ${ecoLabel}`, onClear: () => setEcosystemFilter('all') });
  }
  if (providerFilter !== 'all') {
    activeFilters.push({ key: 'prov', label: `Provider: ${providerFilter}`, onClear: () => setProviderFilter('all') });
  }
  if (sourceQualityFilter !== 'all') {
    const qualLabel = sourceQualityFilter.charAt(0).toUpperCase() + sourceQualityFilter.slice(1);
    activeFilters.push({ key: 'qual', label: `Quality: ${qualLabel}`, onClear: () => setSourceQualityFilter('all') });
  }

  const hasActiveFilters = activeFilters.length > 0;
  const isSearching = !!debouncedSearch;

  return (
    <div className="space-y-6">
      {/* Hero — hide when user is searching */}
      {!isSearching && (
        <section className="text-center py-6" aria-labelledby="hero-heading">
          <h2 id="hero-heading" className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            The Best System Prompts for Every AI Model
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Copy the expert-crafted system prompt for your target model. Paste it into ChatGPT, Claude, or any chatbot. Then ask it to generate prompts following those rules.
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-amber-500" /> 380+ models</span>
            <span className="flex items-center gap-1"><ArrowLeft className="h-3 w-3 rotate-180" /> Paste in your chatbot</span>
            <span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-amber-500" /> Get optimized prompts</span>
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="space-y-3" aria-label="Filter models">
        {/* Category buttons */}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Category filter">
          <button
            onClick={() => setCategoryFilter('all')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
              categoryFilter === 'all'
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-500'
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
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                  categoryFilter === cat
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-500'
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

        {/* Search + Filter row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search models, providers, categories..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="h-8 text-sm"
              aria-label="Search models"
            />
          </div>
          <div className="flex gap-1 shrink-0 flex-wrap items-center" role="group" aria-label="Ecosystem filter">
            {ECOSYSTEMS.map((eco) => (
              <button
                key={eco.value}
                onClick={() => setEcosystemFilter(eco.value)}
                className={cn(
                  'px-2.5 py-1.5 rounded-md text-xs font-medium transition-all border',
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
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="provider-asc">Provider A-Z</SelectItem>
              <SelectItem value="quality-desc">Best Quality</SelectItem>
              <SelectItem value="date-desc">Latest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeFilters.map(f => (
            <Badge key={f.key} variant="secondary" className="gap-1 text-xs py-1">
              {f.label}
              <button onClick={f.onClear} className="hover:text-destructive ml-0.5" aria-label={`Clear ${f.label}`}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <button
            onClick={() => { setCategoryFilter('all'); setEcosystemFilter('all'); setProviderFilter('all'); setSourceQualityFilter('all'); }}
            className="text-xs text-muted-foreground hover:text-foreground ml-1 underline underline-offset-2"
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
          <Button variant="link" size="sm" className="mt-2 text-amber-500" onClick={() => { setCategoryFilter('all'); setEcosystemFilter('all'); setProviderFilter('all'); setSourceQualityFilter('all'); setLocalSearch(''); }}>
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
  const { setSelectedEntryId, setProviderFilter, compareIds, addCompare, removeCompare, isBookmarked, addBookmark, removeBookmark } = useAppStore();
  const isComparing = compareIds.includes(entry.id);
  const bookmarked = isBookmarked(entry.id);
  const catConfig = CATEGORY_CONFIG[entry.category];

  const highlight = useCallback((text: string) => {
    if (!query) return text;
    return highlightMatches(text, query);
  }, [query]);

  return (
    <Card
      className="group hover:border-amber-500/30 transition-all cursor-pointer"
      onClick={() => setSelectedEntryId(entry.id)}
      role="listitem"
    >
      <CardContent className="pt-5">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-semibold text-base truncate" dangerouslySetInnerHTML={{ __html: query ? highlight(entry.modelName) : entry.modelName }} />
              <SourceQualityBadge entry={entry} />
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setProviderFilter(entry.provider); }}
              className="text-xs text-muted-foreground hover:text-amber-500 transition-colors"
              aria-label={`Filter by ${entry.provider}`}
            >
              {entry.provider}
            </button>
          </div>
          <div className="flex gap-1 shrink-0 ml-2">
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 gap-0.5">
              {catConfig.icon}
              {entry.category.toUpperCase()}
            </Badge>
            <Badge className={cn(
              'text-[9px] px-1.5 py-0',
              entry.ecosystem === 'chinese' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
              entry.ecosystem === 'open-weight' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
              'bg-blue-500/10 text-blue-500 border-blue-500/20'
            )} variant="outline">
              {entry.ecosystem === 'chinese' ? 'CN' : entry.ecosystem === 'open-weight' ? 'Open' : 'Com'}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3" dangerouslySetInnerHTML={{ __html: query ? highlight(entry.description) : entry.description }} />

        {/* Short version preview — 3 lines */}
        <div className="bg-muted/30 rounded-lg p-3 mb-3">
          <pre className="text-[11px] font-mono line-clamp-3 whitespace-pre-wrap text-muted-foreground">
            {entry.shortVersion}
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

        {/* Actions */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-border">
          <CopyButton text={entry.systemPrompt} label="Copy" className="flex-1 h-7 text-xs" />
          <TooltipProvider>
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
          </TooltipProvider>
          <TooltipProvider>
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
          </TooltipProvider>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
        </div>
      </CardContent>
    </Card>
  );
});


function OpenInDropdown({ entry }: { entry: SystemPromptEntry }) {
  const defaultPlatform = getChatPlatform(entry.provider);
  const promptText = useAppStore((s) => s.showShortVersion ? (getEntryById(entry.id)?.shortVersion ?? entry.systemPrompt) : entry.systemPrompt);

  const openChat = useCallback((platform: ChatPlatform) => {
    const url = platform.url + encodeURIComponent(promptText);
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [promptText]);

  const otherPlatforms = CHAT_PLATFORMS.filter((p) => p.id !== defaultPlatform.id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5" aria-label="Open in AI chat">
          <MessageSquare className="h-4 w-4" />
          {defaultPlatform.name}
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => openChat(defaultPlatform)} className="gap-2 cursor-pointer">
          <MessageSquare className="h-4 w-4 text-amber-500" />
          <span className="font-medium">{defaultPlatform.name}</span>
        </DropdownMenuItem>
        {otherPlatforms.map((platform) => (
          <DropdownMenuItem key={platform.id} onClick={() => openChat(platform)} className="gap-2 cursor-pointer">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span>{platform.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


function DetailView() {
  const { selectedEntryId, setSelectedEntryId, showShortVersion, setShowShortVersion, isBookmarked, addBookmark, removeBookmark, compareIds, addCompare } = useAppStore();
  const entry = selectedEntryId ? getEntryById(selectedEntryId) : null;
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll to top when entry changes
  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedEntryId]);

  if (!entry) return null;

  const bookmarked = isBookmarked(entry.id);
  const promptText = showShortVersion ? entry.shortVersion : entry.systemPrompt;
  const catConfig = CATEGORY_CONFIG[entry.category];
  const quality = getEntryQuality(entry);

  return (
    <div className="space-y-5" ref={contentRef}>
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => { setSelectedEntryId(null); }}
        className="gap-1.5 text-muted-foreground"
        aria-label="Back to library"
      >
        <ArrowLeft className="h-4 w-4" /> Back to library
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="text-2xl font-bold">{entry.modelName}</h2>
            <Badge variant="outline" className="gap-0.5">
              {catConfig.icon}
              {entry.category.toUpperCase()}
            </Badge>
            <Badge className={cn(
              entry.ecosystem === 'chinese' ? 'bg-red-500/10 text-red-500' :
              entry.ecosystem === 'open-weight' ? 'bg-green-500/10 text-green-500' :
              'bg-blue-500/10 text-blue-500'
            )} variant="outline">
              {entry.ecosystem}
            </Badge>
            <SourceQualityBadge entry={entry} size="lg" />
          </div>
          <p className="text-sm text-muted-foreground">{entry.description}</p>
          <p className="text-xs text-muted-foreground mt-1">By {entry.provider} &bull; Version: {entry.version} &bull; Last verified: {entry.lastVerified}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <OpenInDropdown entry={entry} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => { if (bookmarked) { removeBookmark(entry.id); } else { addBookmark(entry.id, 'full'); } }}
            className={cn(bookmarked ? 'border-amber-500/50 text-amber-500' : '')}
            aria-label={bookmarked ? 'Remove from saved' : 'Save this model'}
          >
            {bookmarked ? <BookmarkCheck className="h-4 w-4 mr-1.5" /> : <Bookmark className="h-4 w-4 mr-1.5" />}
            {bookmarked ? 'Saved' : 'Save'}
          </Button>
          {!compareIds.includes(entry.id) && (
            <Button variant="outline" size="sm" onClick={() => addCompare(entry.id)} aria-label="Add to comparison">
              <GitCompare className="h-4 w-4 mr-1.5" /> Compare
            </Button>
          )}
        </div>
      </div>

      {/* Source Quality Notice */}
      <Card className={cn(
        'border',
        quality === 'verified' && 'border-emerald-500/20 bg-emerald-500/5',
        quality === 'partial' && 'border-amber-500/20 bg-amber-500/5',
        quality === 'limited' && 'border-red-500/20 bg-red-500/5',
      )}>
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            {quality === 'verified' && <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />}
            {quality === 'partial' && <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />}
            {quality === 'limited' && <ShieldQuestion className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />}
            <div>
              <h3 className="text-sm font-semibold mb-1">
                {quality === 'verified' && 'Verified — High Confidence'}
                {quality === 'partial' && 'Partial Verification'}
                {quality === 'limited' && 'Limited Documentation'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {quality === 'verified' && 'This system prompt is based on 3+ official sources (docs, whitepapers, API references, or model cards). High confidence in accuracy.'}
                {quality === 'partial' && 'This system prompt is based on 1-2 official sources. Some rules may be inferred from community guides or blog posts.'}
                {quality === 'limited' && 'This system prompt has limited official documentation. Rules are primarily derived from community resources and may not reflect the latest model capabilities.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Use */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="pt-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            How to Use This System Prompt
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-start gap-2">
              <span className="bg-amber-500/20 text-amber-500 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
              <span>Copy the system prompt below</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-amber-500/20 text-amber-500 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
              <span>Paste it into your AI chatbot (ChatGPT, Claude, etc.) as a system prompt</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-amber-500/20 text-amber-500 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
              <span>Ask: &ldquo;Generate a prompt for [your goal]&rdquo;</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Version Toggle + Copy */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Label htmlFor="version-toggle" className="text-sm font-medium">
            {showShortVersion ? 'Short Version' : 'Full Version'}
          </Label>
          <Switch
            id="version-toggle"
            checked={showShortVersion}
            onCheckedChange={setShowShortVersion}
          />
        </div>
        <CopyButton text={promptText} label={showShortVersion ? 'Copy Short' : 'Copy Full'} className="min-w-[120px]" />
      </div>

      {/* System Prompt */}
      <Card className="border-amber-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            System Prompt {showShortVersion && '(Short Version)'}
          </CardTitle>
          <CardDescription>
            {showShortVersion
              ? 'Condensed version — copy and paste into your chatbot'
              : 'Complete system prompt with all rules and references — copy and paste into your chatbot'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed bg-muted/30 rounded-lg p-5 max-h-[600px] overflow-y-auto">
            {promptText}
          </pre>
        </CardContent>
      </Card>

      {/* Tips */}
      {entry.tips.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              Pro Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {entry.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-amber-500 shrink-0 mt-0.5">&bull;</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Sources */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-400" />
            Sources &amp; References
          </CardTitle>
          <CardDescription>Every rule in this system prompt comes from these official sources.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {entry.sources.map((source, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="text-muted-foreground">{SOURCE_ICONS[source.type]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{source.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[9px] px-1 py-0">{source.type}</Badge>
                    {source.date && <span className="text-[10px] text-muted-foreground">{source.date}</span>}
                  </div>
                </div>
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-500 hover:text-amber-400 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Open ${source.title}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}


function CompareView() {
  const { compareIds, removeCompare, clearCompare, setActiveView } = useAppStore();
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
            <div className="px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/30 border-b border-border">
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
                  'px-4 py-2.5 text-xs font-medium flex items-center gap-1.5 border-b border-border border-l-2',
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
          <div className="flex items-center justify-end gap-1">
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
              const text = promptMode === 'short' ? entry.shortVersion : entry.systemPrompt;
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
                    <h3 className="font-semibold truncate">{entry!.modelName}</h3>
                    <SourceQualityBadge entry={entry!} />
                  </div>
                  <p className="text-xs text-muted-foreground">{entry!.provider}</p>
                </div>
                <Badge variant="outline" className="text-[9px] shrink-0 ml-2">{entry!.category.toUpperCase()}</Badge>
              </div>
              <pre className="text-[11px] font-mono line-clamp-4 whitespace-pre-wrap bg-muted/30 rounded-lg p-3 mb-3">
                {entry!.shortVersion.slice(0, 200)}...
              </pre>
              <div className="flex gap-2">
                <CopyButton text={b.type === 'short' ? entry!.shortVersion : entry!.systemPrompt} label="Copy" className="flex-1 h-7 text-xs" />
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
  const [query, setQuery] = useState('');

  const results = useMemo(() => query ? searchEntries(query) : [], [query]);

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
            onValueChange={setQuery}
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
                      setSelectedEntryId(e.id);
                      setSearchOpen(false);
                      setQuery('');
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
                      setQuery('');
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
      <JsonLd />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6" role="main">
          {activeView === 'browse' && <BrowseView />}
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
