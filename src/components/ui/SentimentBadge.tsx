import type { SentimentType } from '@/types';
import { SENTIMENTS } from '@/data/constants';
import { cn } from '@/lib/utils';

interface Props {
  sentiment: SentimentType;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export function SentimentBadge({ sentiment, size = 'sm', pulse }: Props) {
  const s = SENTIMENTS[sentiment];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold',
        s.bg, s.border, s.text,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot, pulse && sentiment === 'crisis' && 'animate-live-dot')} />
      <span className="capitalize">{sentiment}</span>
    </span>
  );
}
