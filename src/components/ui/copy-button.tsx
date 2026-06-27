'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function CopyButton({ text, label = 'Copy', className }: { text: string; label?: string; className?: string }) {
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
