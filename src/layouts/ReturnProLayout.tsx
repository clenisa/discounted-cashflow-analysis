import type { PropsWithChildren, ReactNode } from 'react';
import { Calculator, Database, ExternalLink, HelpCircle, Search, Settings, GitCompare } from 'lucide-react';
import { NavItem } from '@/components/navigation/NavItem';

interface ReturnProLayoutProps extends PropsWithChildren {
  headerContent?: ReactNode;
  activeSection: ReturnProSection;
  onSectionChange?: (section: ReturnProSection) => void;
}

const sections: Array<{ id: ReturnProSection; label: string; icon: ReactNode }> = [
  {
    id: 'dcf',
    label: 'DCF Calculator',
    icon: <Calculator size={18} />
  },
  {
    id: 'financial-data',
    label: 'Financial Data',
    icon: <Database size={18} />
  },
  {
    id: 'comparison',
    label: 'Scenario Comparison',
    icon: <GitCompare size={18} />
  }
];

export type ReturnProSection = 'dcf' | 'financial-data' | 'comparison';

export const ReturnProLayout = ({ children, headerContent, activeSection, onSectionChange }: ReturnProLayoutProps) => (
  <div className="flex h-screen bg-slate-50 text-slate-900">
    <aside className="hidden w-64 flex-col bg-slate-900 text-white lg:flex">
      <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-base font-bold text-white">
          R1
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-300">ReturnPro</p>
          <p className="text-lg font-semibold text-white">Analytics</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 py-6">
        {sections.map((section) => (
          <NavItem
            key={section.id}
            icon={section.icon}
            active={section.id === activeSection}
            onClick={() => onSectionChange?.(section.id)}
          >
            {section.label}
          </NavItem>
        ))}
      </nav>
      <div className="space-y-2 px-6 pb-6">
        <a
          href="https://therecongroupinc-my.sharepoint.com/:x:/r/personal/clenis_returnpro_com/Documents/2%20-%20DATA/Special%20Projects/iFReturns,%20DCF%20Template.xlsx?d=w7c3302ee1e0a42e4945edaf3f88295bd&csf=1&web=1&e=CDSPxb"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-between rounded-lg bg-primary/10 px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <span>DCF Excel Template</span>
          <ExternalLink size={18} aria-hidden />
        </a>
        <a
          href="https://app.powerbi.com/links/iEtDKMnswN?ctid=afcc02f9-7b18-412a-8981-1fc01424da49&pbi_source=linkShare&bookmarkGuid=6ee0d9f2-0cc0-4290-807e-ad0aefd67a33"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-between rounded-lg bg-primary/10 px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <span>Carlos Master Dash v1.3</span>
          <ExternalLink size={18} aria-hidden />
        </a>
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
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 md:flex">
            <Search size={16} className="text-slate-400" />
            <input
              type="search"
              placeholder="Search models, companies..."
              className="bg-transparent outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="md:hidden">
            <label htmlFor="mobile-section-select" className="sr-only">
              Select workspace section
            </label>
            <div className="relative">
              <select
                id="mobile-section-select"
                value={activeSection}
                onChange={(event) => onSectionChange?.(event.target.value as ReturnProSection)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.label}
                  </option>
                ))}
              </select>
            </div>
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
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-slate-800">Som Mukherjee</p>
              <p className="text-xs text-slate-500">Chief Financial Advisor</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              SM
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto bg-slate-50">{children}</main>
    </div>
  </div>
);
