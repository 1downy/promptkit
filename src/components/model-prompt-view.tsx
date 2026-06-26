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

  const entry = { systemPrompt, shortVersion, ecosystem: ecosystem ?? '', category: category ?? '' } as any;
  const promptText = getDisplayPrompt(entry, showShort ? 'short' : 'full', useChinesePrompt);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(promptText).then(() => {
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  }, [promptText]);

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Label htmlFor="model-prompt-toggle" className="text-sm font-medium">
            {showShort ? 'Short Version' : 'Full Version'}
          </Label>
          <Switch
            id="model-prompt-toggle"
            checked={showShort}
            onCheckedChange={setShowShort}
          />
          {showLangToggle && (
            <>
              <span className="text-xs text-muted-foreground mx-1">|</span>
              <Label htmlFor="model-lang-toggle" className="text-sm font-medium">
                {useChinesePrompt ? '中文' : 'English'}
              </Label>
              <Switch
                id="model-lang-toggle"
                checked={useChinesePrompt}
                onCheckedChange={setUseChinesePrompt}
              />
            </>
          )}
        </div>
        <Button
          variant={copied ? 'default' : 'outline'}
          size="sm"
          onClick={handleCopy}
          className={cn(
            'min-w-[120px]',
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

      <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed bg-muted/30 rounded-xl p-5 border border-amber-500/20 overflow-x-auto">
        {promptText}
      </pre>
    </>
  );
}
