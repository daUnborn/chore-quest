import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ClipboardList, Gift, Bell, Settings, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/tasks', icon: ClipboardList, label: 'Tasks' },
  { to: '/rewards', icon: Gift, label: 'Rewards' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { userProfile } = useAuth();
  
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-lg',
          'lg:z-30', // Lower z-index on desktop
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0' // Always visible on desktop
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-light-gray p-4">
            <h2 className="text-xl font-bold text-pastel-blue">Chore Quest</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => window.innerWidth < 1024 && onClose()}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-medium-gray transition-colors hover:bg-light-gray',
                    isActive && 'bg-pastel-blue bg-opacity-10 text-pastel-blue'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-light-gray p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-sunshine-yellow flex items-center justify-center text-white font-bold">
                {userProfile?.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-dark-slate">
                  {userProfile?.displayName || 'User'}
                </p>
                <p className="text-xs text-medium-gray capitalize">
                  {userProfile?.role || 'Member'} Account
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}