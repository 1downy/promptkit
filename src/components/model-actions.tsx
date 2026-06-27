'use client';

import { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { MessageSquare, ChevronDown, Bookmark, BookmarkCheck } from 'lucide-react';
import { getDisplayPrompt } from '@/lib/promptkit/system-prompts';
import { useAppStore } from '@/lib/promptkit/store';
import { getEntryById } from '@/lib/promptkit/system-prompts';

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

export function ModelActions({ entryId }: { entryId: string }) {
  const getModelViewSetting = useAppStore(s => s.getModelViewSetting);
  const bookmarks = useAppStore(s => s.bookmarks);
  const addBookmark = useAppStore(s => s.addBookmark);
  const removeBookmark = useAppStore(s => s.removeBookmark);

  const entry = getEntryById(entryId);
  const modelSettings = getModelViewSetting(entryId);
  const showShort = modelSettings.showShortVersion ?? false;
  const useChinese = modelSettings.useChinesePrompt ?? true;

  const defaultPlatform = useMemo(() => entry ? getChatPlatform(entry.provider) : CHAT_PLATFORMS[0], [entry]);
  const otherPlatforms = useMemo(() => CHAT_PLATFORMS.filter((p) => p.id !== defaultPlatform.id), [defaultPlatform]);

  const promptText = useMemo(() => {
    if (!entry) return '';
    return getDisplayPrompt(entry, showShort ? 'short' : 'full', useChinese);
  }, [entry, showShort, useChinese]);

  const bookmarked = bookmarks.some(b => b.entryId === entryId);

  const openChat = useCallback((platform: ChatPlatform) => {
    const url = platform.url + encodeURIComponent(promptText);
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [promptText]);

  if (!entry) return null;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer h-8 text-xs">
            <MessageSquare className="h-3.5 w-3.5" />
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
      <Button
        variant="outline"
        size="sm"
        onClick={() => { if (bookmarked) { removeBookmark(entryId); } else { addBookmark(entryId, 'full'); } }}
        className={cn(bookmarked ? 'border-amber-500/50 text-amber-500' : '', 'cursor-pointer h-8 text-xs')}
        aria-label={bookmarked ? 'Remove from saved' : 'Save this model'}
      >
        {bookmarked ? <BookmarkCheck className="h-3.5 w-3.5 mr-1.5" /> : <Bookmark className="h-3.5 w-3.5 mr-1.5" />}
        {bookmarked ? 'Saved' : 'Save'}
      </Button>
    </div>
  );
}
