'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/promptkit/store';
import { getEntryById, getDisplayPrompt } from '@/lib/promptkit/system-prompts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SourceQualityBadge } from '@/components/ui/source-quality-badge';
import { CopyButton } from '@/components/ui/copy-button';
import { Bookmark, X } from 'lucide-react';

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
        <Badge variant="secondary">{entries.length} saved</Badge>
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

export default BookmarksView;
