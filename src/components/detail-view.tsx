'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAppStore } from '@/lib/promptkit/store';
import {
  getEntryById,
  getDisplayPrompt,
  getSourceQuality,
  type SystemPromptEntry,
  type SourceRef,
  type ModelCategory,
} from '@/lib/promptkit/system-prompts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertCircle, ArrowLeft, Bookmark, BookmarkCheck, BookOpen, Box,
  ChevronDown, Code2, ExternalLink, Eye, FileText, GitCompare, Github, Globe,
  Globe2, ImageIcon, Link as LinkIcon, MessageSquare, Music, PenTool,
  Shield, ShieldAlert, ShieldCheck, ShieldQuestion, Sparkles, Trophy,
  Type, Users, Video, X, Zap,
} from 'lucide-react';
import {
  getArenaRanking,
  getVideoArenaRanking,
  getTextArenaRanking,
  getImageToVideoArenaRanking,
  type ArenaRanking,
} from '@/lib/promptkit/arena-ranks';
import { cn } from '@/lib/utils';
import { CopyButton } from '@/components/ui/copy-button';
import { SourceQualityBadge } from '@/components/ui/source-quality-badge';

// ---------------------------------------------------------------------------
// Shared UI config
// ---------------------------------------------------------------------------

export const CATEGORY_CONFIG: Record<ModelCategory, { label: string; icon: React.ReactNode }> = {
  text:      { label: 'Text',      icon: <Type className="h-3.5 w-3.5" /> },
  image:     { label: 'Image',     icon: <ImageIcon className="h-3.5 w-3.5" /> },
  video:     { label: 'Video',     icon: <Video className="h-3.5 w-3.5" /> },
  code:      { label: 'Code',      icon: <Code2 className="h-3.5 w-3.5" /> },
  vision:    { label: 'Vision',    icon: <Eye className="h-3.5 w-3.5" /> },
  character: { label: 'Character', icon: <Users className="h-3.5 w-3.5" /> },
  '3d':      { label: '3D',        icon: <Box className="h-3.5 w-3.5" /> },
  audio:     { label: 'Audio',     icon: <Music className="h-3.5 w-3.5" /> },
  design:    { label: 'Design',    icon: <PenTool className="h-3.5 w-3.5" /> },
  embedding: { label: 'Embedding', icon: <LinkIcon className="h-3.5 w-3.5" /> },
  moderation:{ label: 'Moderation', icon: <ShieldAlert className="h-3.5 w-3.5" /> },
  world:     { label: 'World',     icon: <Globe2 className="h-3.5 w-3.5" /> },
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG) as ModelCategory[];

// ---------------------------------------------------------------------------
// Chat platform helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Source type icons
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Open in AI chat dropdown
// ---------------------------------------------------------------------------

function OpenInDropdown({ entry, shortVersion, chinesePrompt }: { entry: SystemPromptEntry; shortVersion?: boolean; chinesePrompt?: boolean }) {
  const defaultPlatform = getChatPlatform(entry.provider);
  const showShort = shortVersion ?? useAppStore((s) => s.showShortVersion);
  const useChinese = chinesePrompt ?? useAppStore((s) => s.useChinesePrompt);
  const promptText = getDisplayPrompt(entry, showShort ? 'short' : 'full', useChinese);

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

// ---------------------------------------------------------------------------
// Arena ranking card
// ---------------------------------------------------------------------------

function ArenaRankCard({ ranking, label }: { ranking: ArenaRanking; label: string }) {
  return (
    <Card className="border-purple-500/20 bg-purple-500/5">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Trophy className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h3 className="text-sm font-semibold">{label} Arena Ranking</h3>
              {ranking.preliminary && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 text-amber-500 border-amber-500/30">
                  Preliminary
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Rank</p>
                <p className="text-lg font-bold text-purple-400">
                  #{ranking.rank}
                  {ranking.rankSpread !== `${ranking.rank} ${ranking.rank}` && (
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      (range {ranking.rankSpread})
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Elo Score</p>
                <p className="text-lg font-bold">{ranking.score} <span className="text-xs text-muted-foreground font-normal">±{ranking.ci}</span></p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Votes</p>
                <p className="text-lg font-bold">{ranking.votes.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Provider</p>
                <p className="text-sm font-medium truncate">{ranking.organization}</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Based on {ranking.votes.toLocaleString()} blind user votes &bull; 95% CI: ±{ranking.ci} &bull; License: {ranking.license}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Detail view — full model page
// ---------------------------------------------------------------------------

export function DetailView() {
  const { selectedEntryId, setSelectedEntryId, getModelViewSetting, setModelViewSetting, isBookmarked, addBookmark, removeBookmark, compareIds, addCompare, removeCompare } = useAppStore();
  const entry = selectedEntryId ? getEntryById(selectedEntryId) : null;
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll to top when entry changes
  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedEntryId]);

  const modelSettings = entry ? getModelViewSetting(entry.id) : {};
  const showShortVersion = modelSettings.showShortVersion ?? false;
  const useChinesePrompt = modelSettings.useChinesePrompt ?? true;

  const promptText = useMemo(() => {
    if (!entry) return '';
    return getDisplayPrompt(entry, showShortVersion ? 'short' : 'full', useChinesePrompt);
  }, [entry, showShortVersion, useChinesePrompt]);

  const promptLines = useMemo(() => {
    if (!promptText) return [];
    return promptText.split('\n');
  }, [promptText]);

  if (!entry) return null;

  const bookmarked = isBookmarked(entry.id);
  const catConfig = CATEGORY_CONFIG[entry.category];
  const quality = getSourceQuality(entry);
  const isVideo = entry.category === 'video';
  const isImage = entry.category === 'image' || entry.category === 'design';
  const isText = entry.category === 'text';
  const t2vRanking = isVideo ? getVideoArenaRanking(entry.modelName) : null;
  const i2vRanking = isVideo ? getImageToVideoArenaRanking(entry.modelName) : null;
  const arenaRanking = isVideo
    ? null
    : isImage
    ? getArenaRanking(entry.modelName)
    : isText
    ? getTextArenaRanking(entry.modelName)
    : null;

  return (
    <div className="space-y-5" ref={contentRef}>
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => { setSelectedEntryId(null); }}
        className="gap-1.5 text-muted-foreground cursor-pointer"
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
              entry.ecosystem === 'chinese' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
              entry.ecosystem === 'open-weight' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
              'bg-blue-500/10 text-blue-500 border-blue-500/20'
            )} variant="outline">
              {entry.ecosystem}
            </Badge>
            <SourceQualityBadge entry={entry} size="lg" />
          </div>
          <p className="text-sm text-muted-foreground">{entry.description}</p>
          <p className="text-xs text-muted-foreground mt-1">By {entry.provider} &bull; Version: {entry.version} &bull; Last verified: {entry.lastVerified}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <OpenInDropdown entry={entry} shortVersion={showShortVersion} chinesePrompt={useChinesePrompt} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => { if (bookmarked) { removeBookmark(entry.id); } else { addBookmark(entry.id, 'full'); } }}
            className={cn(bookmarked ? 'border-amber-500/50 text-amber-500' : '', 'cursor-pointer')}
            aria-label={bookmarked ? 'Remove from saved' : 'Save this model'}
          >
            {bookmarked ? <BookmarkCheck className="h-4 w-4 mr-1.5" /> : <Bookmark className="h-4 w-4 mr-1.5" />}
            {bookmarked ? 'Saved' : 'Save'}
          </Button>
          {!compareIds.includes(entry.id) ? (
            <Button variant="outline" size="sm" onClick={() => addCompare(entry.id)} className="cursor-pointer" aria-label="Add to comparison">
              <GitCompare className="h-4 w-4 mr-1.5" /> Compare
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => removeCompare(entry.id)} className="border-blue-500/30 text-blue-500 bg-blue-500/5 cursor-pointer" aria-label="Remove comparison">
              <X className="h-4 w-4 mr-1.5" /> Remove
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

      {/* Arena Rankings */}
      {isVideo && t2vRanking && (
        <ArenaRankCard ranking={t2vRanking} label="Text-to-Video" />
      )}
      {isVideo && i2vRanking && (
        <ArenaRankCard ranking={i2vRanking} label="Image-to-Video" />
      )}
      {!isVideo && arenaRanking && (
        <ArenaRankCard ranking={arenaRanking} label={isImage ? 'Text-to-Image' : 'Chatbot'} />
      )}

      {/* Version Toggle + Language Toggle + Copy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-muted/30 rounded-xl border border-border/80 flex-wrap">
        <div className="flex flex-row items-center gap-2 w-full sm:w-auto flex-wrap">
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-background/50 dark:bg-background/20 px-3 py-2 sm:p-0 rounded-lg border border-border/50 sm:border-0 flex-1 sm:flex-none">
            <Label htmlFor="version-toggle" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              {showShortVersion ? 'Short' : 'Full'}
            </Label>
            <Switch
              id="version-toggle"
              checked={showShortVersion}
              onCheckedChange={(v) => entry && setModelViewSetting(entry.id, { showShortVersion: v })}
            />
          </div>
          {entry.ecosystem === 'chinese' && ['image', 'video', '3d'].includes(entry.category) && (
            <div className="flex items-center justify-between sm:justify-start gap-2 bg-background/50 dark:bg-background/20 px-3 py-2 sm:p-0 rounded-lg border border-border/50 sm:border-0 flex-1 sm:flex-none sm:border-l sm:border-border/60 sm:pl-3">
              <Label htmlFor="lang-toggle" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                {useChinesePrompt ? '中文' : 'EN'}
              </Label>
              <Switch
                id="lang-toggle"
                checked={useChinesePrompt}
                onCheckedChange={(v) => entry && setModelViewSetting(entry.id, { useChinesePrompt: v })}
              />
            </div>
          )}
        </div>
        <CopyButton text={promptText} label={showShortVersion ? 'Copy Short' : 'Copy Full'} className="w-full sm:w-auto min-w-[120px] shrink-0 cursor-pointer" />
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
          <div className="relative border border-zinc-800 bg-zinc-950 rounded-xl overflow-hidden font-mono text-sm leading-relaxed shadow-2xl">
            {/* Editor-like top bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5 font-sans">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/30 border border-red-500/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30 border border-yellow-500/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/30 border border-green-500/50" />
                <span className="ml-2 font-medium tracking-wide text-[10px] text-zinc-500 uppercase">SYSTEM_INSTRUCTIONS.md</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-sans">{promptLines.length} lines</span>
            </div>

            {/* Code area with line numbers */}
            <div className="flex max-h-[550px] overflow-y-auto custom-scrollbar bg-zinc-950/95 font-mono text-[11px] sm:text-xs py-4 leading-5">
              <div className="w-full flex flex-col">
                {promptLines.map((line, i) => (
                  <div key={i} className="flex items-start hover:bg-zinc-800/30 transition-colors px-4 group">
                    <span className="select-none text-right w-10 shrink-0 pr-4 text-zinc-500 text-xs mt-0.5 border-r border-zinc-700/50 mr-4 font-mono">
                      {i + 1}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap break-all text-zinc-300">
                      {line === '' ? ' ' : line}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
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

      {/* Floating Actions bar on Mobile */}
      <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden bg-background/85 backdrop-blur-lg border border-border shadow-2xl rounded-full p-2 flex items-center justify-between gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex-1">
          <CopyButton text={promptText} label={showShortVersion ? 'Copy Short' : 'Copy Full'} className="w-full h-10 rounded-full cursor-pointer" />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => { if (bookmarked) { removeBookmark(entry.id); } else { addBookmark(entry.id, 'full'); } }}
          className={cn('h-10 w-10 rounded-full shrink-0 cursor-pointer', bookmarked ? 'border-amber-500/50 text-amber-500 bg-amber-500/5' : '')}
          aria-label={bookmarked ? 'Remove from saved' : 'Save model'}
        >
          {bookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
        </Button>
        {!compareIds.includes(entry.id) ? (
          <Button variant="outline" size="icon" onClick={() => addCompare(entry.id)} className="h-10 w-10 rounded-full shrink-0 cursor-pointer" aria-label="Compare model">
            <GitCompare className="h-5 w-5" />
          </Button>
        ) : (
          <Button variant="outline" size="icon" onClick={() => removeCompare(entry.id)} className="h-10 w-10 rounded-full shrink-0 text-blue-500 border-blue-500/30 bg-blue-500/5 cursor-pointer" aria-label="Remove comparison">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="h-16 md:hidden" />
    </div>
  );
}
