import type { ReactNode } from 'react';
import clsx from 'clsx';
import { Info } from 'lucide-react';
import { formatPercentage } from '@/utils/format';
import { useCurrency } from '@/contexts/CurrencyContext';

type MetricFormat = 'currency' | 'percentage';

const COLOR_MAP: Record<string, { text: string; background: string }> = {
  blue: { text: 'text-primary', background: 'bg-primary/10' },
  green: { text: 'text-success', background: 'bg-success/10' },
  purple: { text: 'text-purple', background: 'bg-purple/10' },
  orange: { text: 'text-warning', background: 'bg-warning/10' }
};

interface MetricCardProps {
  title: string;
  value: number;
  format: MetricFormat;
  icon: ReactNode;
  color?: keyof typeof COLOR_MAP;
  info?: string;
}

export const MetricCard = ({ title, value, format, icon, color = 'blue', info }: MetricCardProps) => {
  const { formatCurrency } = useCurrency();
  const palette = COLOR_MAP[color] ?? COLOR_MAP.blue;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="pr-2">
          <p className="flex items-center text-sm font-medium text-slate-500">
            {title}
            {info ? (
              <button
                type="button"
                className="group relative ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label={`More information about ${title}`}
              >
                <Info size={16} aria-hidden />
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-48 -translate-x-1/2 rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {info}
                </span>
              </button>
            ) : null}
          </p>
          <p className={clsx('mt-2 text-3xl font-semibold', palette.text)}>
            {format === 'currency' ? formatCurrency(value) : formatPercentage(value)}
          </p>
        </div>
        <div className={clsx('flex h-12 w-12 items-center justify-center rounded-lg', palette.background)}>
          {icon}
        </div>
      </div>
    </div>
  );
};
