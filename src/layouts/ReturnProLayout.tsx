import type { PropsWithChildren, ReactNode } from 'react';
import { UnifiedLayout, type ReturnProSection } from './UnifiedLayout';

interface ReturnProLayoutProps extends PropsWithChildren {
  headerContent?: ReactNode;
  activeSection: ReturnProSection;
  onSectionChange?: (section: ReturnProSection) => void;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export const ReturnProLayout = ({ 
  children, 
  headerContent, 
  activeSection, 
  onSectionChange,
  breadcrumbs 
}: ReturnProLayoutProps) => (
  <UnifiedLayout
    activeSection={activeSection}
    onSectionChange={onSectionChange || (() => {})}
    headerContent={headerContent}
    breadcrumbs={breadcrumbs}
  >
    {children}
  </UnifiedLayout>
);

export type { ReturnProSection };
