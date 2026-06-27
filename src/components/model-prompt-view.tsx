'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/promptkit/store';
import { getDisplayPrompt } from '@/lib/promptkit/system-prompts';

export function ModelPromptView({
  systemPrompt,
  shortVersion,
  ecosystem,
  category,
}: {
  systemPrompt: string;
  shortVersion: string;
  ecosystem?: string;
  category?: string;
}) {
  const [showShort, setShowShort] = useState(false);
  const [copied, setCopied] = useState(false);
  const useChinesePrompt = useAppStore(s => s.useChinesePrompt);
  const setUseChinesePrompt = useAppStore(s => s.setUseChinesePrompt);
  const showLangToggle = ecosystem === 'chinese' && category && ['image', 'video', '3d'].includes(category);

  const entry = { systemPrompt, shortVersion, ecosystem: ecosystem ?? '', category: category ?? '' };
  const promptText = getDisplayPrompt(entry, showShort ? 'short' : 'full', useChinesePrompt);
  const promptLines = promptText.split('\n');

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(promptText).then(() => {
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  }, [promptText]);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-muted/30 rounded-xl border border-border/80 mb-3 flex-wrap">
        <div className="flex flex-row items-center gap-2 w-full sm:w-auto flex-wrap">
          <div className="flex items-center justify-between sm:justify-start gap-2 bg-background/50 dark:bg-background/20 px-3 py-2 sm:p-0 rounded-lg border border-border/50 sm:border-0 flex-1 sm:flex-none">
            <Label htmlFor="model-prompt-toggle" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              {showShort ? 'Short' : 'Full'}
            </Label>
            <Switch
              id="model-prompt-toggle"
              checked={showShort}
              onCheckedChange={setShowShort}
            />
          </div>
          {showLangToggle && (
            <div className="flex items-center justify-between sm:justify-start gap-2 bg-background/50 dark:bg-background/20 px-3 py-2 sm:p-0 rounded-lg border border-border/50 sm:border-0 flex-1 sm:flex-none sm:border-l sm:border-border/60 sm:pl-3">
              <Label htmlFor="model-lang-toggle" className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                {useChinesePrompt ? '中文' : 'EN'}
              </Label>
              <Switch
                id="model-lang-toggle"
                checked={useChinesePrompt}
                onCheckedChange={setUseChinesePrompt}
              />
            </div>
          )}
        </div>
        <Button
          variant={copied ? 'default' : 'outline'}
          size="sm"
          onClick={handleCopy}
          className={cn(
            'w-full sm:w-auto min-w-[120px] shrink-0 cursor-pointer',
            copied && 'bg-green-600 hover:bg-green-700 text-white'
          )}
        >
          {copied ? (
            <><Check className="h-3.5 w-3.5 mr-1.5" />Copied!</>
          ) : (
            <><Copy className="h-3.5 w-3.5 mr-1.5" />{showShort ? 'Copy Short' : 'Copy Full'}</>
          )}
        </Button>
      </div>

      <div className="relative border border-zinc-800 bg-zinc-950 rounded-xl overflow-hidden font-mono text-sm leading-relaxed shadow-2xl mt-4">
        {/* Editor-like top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400 font-sans">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/30 border border-red-500/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30 border border-yellow-500/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/30 border border-green-500/50" />
            <span className="ml-2 font-medium tracking-wide text-[10px] text-zinc-500 uppercase">SYSTEM_INSTRUCTIONS.md</span>
          </div>
          <span className="text-[10px] text-zinc-500">{promptLines.length} lines</span>
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
    </>
  );
}
