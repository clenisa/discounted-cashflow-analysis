import type { ReactNode } from 'react';
import clsx from 'clsx';

interface NavItemProps {
  icon: ReactNode;
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export const NavItem = ({ icon, children, active = false, onClick }: NavItemProps) => (
  <button
    type="button"
    className={clsx(
      'w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors',
      'text-slate-200/80 hover:text-white hover:bg-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
      active && 'bg-slate-700/80 text-white'
    )}
    onClick={onClick}
  >
    <span className="flex h-5 w-5 items-center justify-center text-lg">{icon}</span>
    <span>{children}</span>
  </button>
);
