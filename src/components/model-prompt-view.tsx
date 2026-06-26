'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export function ModelPromptView({
  systemPrompt,
  shortVersion,
}: {
  systemPrompt: string;
  shortVersion: string;
}) {
  const [showShort, setShowShort] = useState(false);
  const [copied, setCopied] = useState(false);

  const promptText = showShort ? shortVersion : systemPrompt;

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
