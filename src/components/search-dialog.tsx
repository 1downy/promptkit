'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/promptkit/store';
import { searchEntries, highlightMatches, SystemPromptEntry } from '@/lib/promptkit/system-prompts';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { SourceQualityBadge } from '@/components/ui/source-quality-badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

function SearchDialog() {
  const { searchOpen, setSearchOpen, setSelectedEntryId, setCategoryFilter, setActiveView } = useAppStore();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = useCallback((val: string) => {
    setQuery(val);
    setIsSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(val);
      setIsSearching(false);
    }, 150);
  }, []);

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
  const showSearchLoading = isSearching && !results.length;

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
            {showSearchLoading ? (
              <div className="p-2 space-y-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-2 py-2.5">
                    <Skeleton className="h-4 w-14 shrink-0 rounded" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-3 w-20 shrink-0" />
                    <Skeleton className="h-3 w-10 shrink-0 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <>
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
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export default SearchDialog;
