'use client';

import { Badge } from '@/components/ui/badge';
import { getSourceQuality } from '@/lib/promptkit/system-prompts';
import type { SystemPromptEntry } from '@/lib/promptkit/system-prompts';
import { ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SourceQualityBadge({ entry, size = 'sm' }: { entry: SystemPromptEntry; size?: 'sm' | 'lg' }) {
  const quality = getSourceQuality(entry);
  const isSm = size === 'sm';

  const config: Record<'verified' | 'partial' | 'limited', { label: string; icon: React.ReactNode; className: string }> = {
    verified: {
      label: 'Verified',
      icon: <ShieldCheck className={isSm ? 'h-3 w-3' : 'h-3.5 w-3.5'} />,
      className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    },
    partial: {
      label: 'Partial',
      icon: <ShieldAlert className={isSm ? 'h-3 w-3' : 'h-3.5 w-3.5'} />,
      className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    },
    limited: {
      label: 'Limited Docs',
      icon: <ShieldQuestion className={isSm ? 'h-3 w-3' : 'h-3.5 w-3.5'} />,
      className: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
  };

  const c = config[quality];
  return (
    <Badge variant="outline" className={cn('gap-1 font-medium', c.className, isSm ? 'text-[9px] px-1.5 py-0' : 'text-[10px] px-2 py-0.5')}>
      {c.icon}
      {c.label}
    </Badge>
  );
}
