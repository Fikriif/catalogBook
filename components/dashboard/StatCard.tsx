import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: 'positive' | 'negative' | 'neutral' | 'warning' | 'info';
  };
  accentColor?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, badge, accentColor }: StatCardProps) {
  const badgeClasses = {
    positive: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    negative: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
    neutral: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${accentColor || 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200'}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {value}
        </div>
        <div className="flex items-center gap-2 mt-2">
          {badge && (
            <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badgeClasses[badge.variant]}`}>
              {badge.text}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

