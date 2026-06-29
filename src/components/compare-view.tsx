'use client';

import React, { useMemo, useState } from 'react';
import { useAppStore } from '@/lib/promptkit/store';
import { getEntryById, getSourceQuality as getEntryQuality, getDisplayPrompt, SystemPromptEntry } from '@/lib/promptkit/system-prompts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SourceQualityBadge } from '@/components/ui/source-quality-badge';
import { CopyButton } from '@/components/ui/copy-button';
import { cn } from '@/lib/utils';
import { GitCompare, X, AlertCircle, FileText, Layers } from 'lucide-react';

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

      {viewMode === 'specs' && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <div
            className="min-w-[500px]"
            style={{ display: 'grid', gridTemplateColumns: `140px repeat(${entries.length}, 1fr)` }}
          >
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

      {viewMode === 'prompts' && (
        <div className="space-y-4">
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

export default CompareView;
