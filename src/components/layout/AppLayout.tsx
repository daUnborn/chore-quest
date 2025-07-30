import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils/cn';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open on desktop

  return (
    <div className="min-h-screen bg-light-gray">
      {/* Sidebar - controlled by state */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main content */}
      <div className={cn(
        'min-h-screen transition-all duration-300',
        isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0',
        'pb-16 lg:pb-0'
      )}>
        {children || <Outlet />}
      </div>

      {/* Bottom navigation for mobile - visible on all pages */}
      <BottomNav />
    </div>
  );
}