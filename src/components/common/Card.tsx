import type { PropsWithChildren, ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps extends PropsWithChildren {
  title?: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export const Card = ({ title, subtitle, actions, children, className }: CardProps) => (
  <div
    className={clsx(
      'bg-white rounded-xl shadow-sm border border-slate-200/80',
      'transition-shadow hover:shadow-md focus-within:shadow-md',
      className
    )}
  >
    {(title || subtitle || actions) && (
      <div className="flex items-start justify-between p-6 border-b border-slate-100">
        <div>
          {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);
