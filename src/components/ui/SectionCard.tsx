import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function SectionCard({ title, subtitle, icon, actions, children, className, bodyClassName }: Props) {
  return (
    <section
      className={cn(
        'glass rounded-2xl shadow-card transition-colors',
        'hover:border-white/12',
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-4 py-3.5">
        <div className="flex items-start gap-2.5 min-w-0">
          {icon && (
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent-500/20 bg-accent-500/10 text-accent-300">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-100">{title}</h3>
            {subtitle && <p className="truncate text-[11px] text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
      <div className={cn('p-4', bodyClassName)}>{children}</div>
    </section>
  );
}
