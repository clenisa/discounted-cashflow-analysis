import type { PropsWithChildren, ReactNode } from 'react';
import { BarChart3, Calculator, Database, FileBarChart, HelpCircle, Search, Settings } from 'lucide-react';
import { NavItem } from '@/components/navigation/NavItem';

interface ReturnProLayoutProps extends PropsWithChildren {
  headerContent?: ReactNode;
}

export const ReturnProLayout = ({ children, headerContent }: ReturnProLayoutProps) => (
  <div className="flex h-screen bg-slate-50 text-slate-900">
    <aside className="hidden w-64 flex-col bg-slate-900 text-white lg:flex">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-base font-bold">
          R1
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-300">ReturnPro</p>
          <p className="text-lg font-semibold">Analytics</p>
        </div>
      </div>
      <nav className="flex-1 py-6 space-y-1">
        <NavItem icon={<Calculator size={18} />} active>
          DCF Calculator
        </NavItem>
        <NavItem icon={<BarChart3 size={18} />}>Valuation Models</NavItem>
        <NavItem icon={<Database size={18} />}>Financial Data</NavItem>
        <NavItem icon={<FileBarChart size={18} />}>Reports</NavItem>
      </nav>
      <div className="px-6 pb-6">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg bg-slate-800 px-4 py-3 text-sm text-slate-200 hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <span className="font-medium">Support</span>
          <HelpCircle size={18} className="text-slate-400" />
        </button>
      </div>
    </aside>
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <Search size={16} className="text-slate-400" />
            <input
              type="search"
              placeholder="Search models, companies..."
              className="bg-transparent outline-none placeholder:text-slate-400"
            />
          </div>
          {headerContent}
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-slate-800">Alex Morgan</p>
              <p className="text-xs text-slate-500">Chief Financial Officer</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              AM
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
    </div>
  </div>
);
