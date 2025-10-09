import type { ReactNode } from 'react';
import clsx from 'clsx';
import { formatCurrency, formatPercentage } from '@/utils/format';

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
}

export const MetricCard = ({ title, value, format, icon, color = 'blue' }: MetricCardProps) => {
  const palette = COLOR_MAP[color] ?? COLOR_MAP.blue;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
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
