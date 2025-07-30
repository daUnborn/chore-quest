import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { BottomNav } from './BottomNav';
import { PageHeader } from './PageHeader';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils/cn';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-light-gray">
      {/* Sidebar for desktop/tablet */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main content */}
      <div className={cn('pb-16 lg:pb-0', isSidebarOpen && 'lg:ml-64')}>
        {children || <Outlet />}
      </div>

      {/* Bottom navigation for mobile */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}