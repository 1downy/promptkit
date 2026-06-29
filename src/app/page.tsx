'use client';

import React, { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore } from '@/lib/promptkit/store';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Zap, Sun, Moon, Search, Bookmark, GitCompare, Github, Keyboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
const BrowseView = dynamic(() => import('@/components/browse-view'), { ssr: false });
const DetailView = dynamic(() => import('@/components/detail-view').then(m => m.DetailView), { ssr: false });
const SearchDialog = dynamic(() => import('@/components/search-dialog'), { ssr: false });
const CompareView = dynamic(() => import('@/components/compare-view'), { ssr: false });
const BookmarksView = dynamic(() => import('@/components/bookmarks-view'), { ssr: false });












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


function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border p-5 space-y-3 animate-pulse">
      {/* Header: title + badge */}
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-28 rounded bg-muted/60" />
            <div className="h-3.5 w-14 rounded-full bg-muted/60" />
          </div>
          <div className="h-3 w-20 rounded bg-muted/40" />
        </div>
        <div className="h-4 w-12 rounded bg-muted/60 shrink-0 ml-2" />
      </div>
      {/* Rank + ecosystem badges */}
      <div className="flex gap-1.5">
        <div className="h-4 w-16 rounded-full bg-muted/60" />
        <div className="h-4 w-10 rounded-full bg-muted/60" />
      </div>
      {/* Description (2 lines) */}
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded bg-muted/50" />
        <div className="h-3 w-3/4 rounded bg-muted/50" />
      </div>
      {/* Prompt preview */}
      <div className="rounded-lg bg-muted/30 p-3 space-y-1.5">
        <div className="h-2.5 w-full rounded bg-muted/50" />
        <div className="h-2.5 w-11/12 rounded bg-muted/50" />
        <div className="h-2.5 w-4/5 rounded bg-muted/50" />
      </div>
      {/* Sources */}
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded bg-muted/60" />
        <div className="h-2.5 w-16 rounded bg-muted/60" />
        <div className="h-3.5 w-10 rounded bg-muted/60" />
        <div className="h-3.5 w-12 rounded bg-muted/60" />
      </div>
      {/* Actions */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-border">
        <div className="h-7 flex-1 rounded-md bg-muted/60" />
        <div className="h-7 w-7 rounded-md bg-muted/60" />
        <div className="h-7 w-7 rounded-md bg-muted/60" />
        <div className="h-3.5 w-3.5 rounded ml-auto bg-muted/40" />
      </div>
    </div>
  );
}

function BrowseSkeleton() {
  return (
    <div className="space-y-6">
      {/* Category pills */}
      <div className="flex gap-1.5 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-7 w-16 rounded-lg bg-muted/40 animate-pulse" />
        ))}
      </div>
      {/* Search + filter bar */}
      <div className="flex gap-3">
        <div className="h-8 flex-1 rounded-md bg-muted/40 animate-pulse" />
        <div className="hidden md:flex gap-1">
          <div className="h-8 w-16 rounded-md bg-muted/40 animate-pulse" />
          <div className="h-8 w-16 rounded-md bg-muted/40 animate-pulse" />
          <div className="h-8 w-16 rounded-md bg-muted/40 animate-pulse" />
          <div className="h-8 w-24 rounded-md bg-muted/40 animate-pulse" />
          <div className="h-8 w-28 rounded-md bg-muted/40 animate-pulse" />
        </div>
      </div>
      {/* Results count */}
      <div className="h-3 w-48 rounded bg-muted/30 animate-pulse" />
      {/* Entry cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
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

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 min-h-[calc(100vh-7rem)]" role="main">
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
                <span>400 system prompts</span>
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
