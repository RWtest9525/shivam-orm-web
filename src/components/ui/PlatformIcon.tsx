import type { PlatformId } from '@/types';
import {
  Smartphone, ShoppingCart, Instagram, Linkedin, MessageCircle, Store, Globe
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAP: Record<string, LucideIcon> = {
  playstore: Smartphone,
  amazon: ShoppingCart,
  social: Instagram,
  instagram: Instagram,
  linkedin: Linkedin,
  reddit: MessageCircle,
  indiamart: Store,
};

export function PlatformIcon({ platform, className }: { platform: PlatformId | string; className?: string }) {
  const Icon = MAP[platform] || Globe;
  return <Icon className={cn('h-3.5 w-3.5', className)} />;
}
