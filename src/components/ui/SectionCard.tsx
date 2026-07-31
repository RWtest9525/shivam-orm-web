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
        'glass rounded-2xl shadow-card transition-all border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.02]',
        className
      )}
    >
      <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-white/[0.08]">
        <div className="flex items-start gap-3 min-w-0">
          {icon && (
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600 dark:bg-accent-500/20 dark:text-accent-300">
              {icon}
            </span>
          )}
          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-slate-900 dark:text-slate-100">{title}</h3>
            {subtitle && <p className="truncate text-xs font-bold text-slate-600 dark:text-slate-400">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </section>
  );
}
