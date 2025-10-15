import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (href: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, onNavigate }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {/* Home Icon */}
        <li>
          <div className="flex items-center">
            <Home size={16} className="text-slate-400" />
          </div>
        </li>

        {/* Breadcrumb Items */}
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <ChevronRight size={16} className="text-slate-400 mx-2" />
              {item.href ? (
                <button
                  onClick={() => onNavigate?.(item.href!)}
                  className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-sm font-medium text-slate-900">
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};