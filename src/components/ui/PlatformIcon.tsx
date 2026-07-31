import type { PlatformId } from '@/types';
import {
  Smartphone, ShoppingCart, Instagram, Linkedin, MessageCircle, Store,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAP: Record<PlatformId, LucideIcon> = {
  playstore: Smartphone,
  amazon: ShoppingCart,
  social: Instagram,
  linkedin: Linkedin,
  reddit: MessageCircle,
  indiamart: Store,
};

export function PlatformIcon({ platform, className }: { platform: PlatformId; className?: string }) {
  const Icon = MAP[platform];
  return <Icon className={cn('h-3.5 w-3.5', className)} />;
}
