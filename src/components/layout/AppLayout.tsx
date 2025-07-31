import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils/cn';

interface AppLayoutProps {
  children?: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile

  return (
    <div className="min-h-screen bg-light-gray">
      {/* Sidebar - toggleable on mobile, always visible on desktop */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main content */}
      <div className={cn(
        'min-h-screen transition-all duration-300',
        'lg:ml-64', // Always leave space for sidebar on desktop
        'pb-16 lg:pb-0' // Bottom padding for mobile nav only
      )}>
        {children || <Outlet />}
      </div>

      {/* Bottom navigation - mobile and tablet only */}
      <BottomNav />
    </div>
  );
}