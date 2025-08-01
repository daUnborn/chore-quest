import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ClipboardList, Gift, Bell, Settings, X, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/tasks', icon: ClipboardList, label: 'Tasks' },
  { to: '/rewards', icon: Gift, label: 'Rewards' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { userProfile } = useAuth();

  // Get current display name based on active profile
  const getCurrentDisplayName = () => {
    if (!userProfile) return '';
    
    if (userProfile.activeProfile === 'parent') {
      return userProfile.displayName; // Original parent name
    }
    
    // Find child profile
    const childProfile = userProfile.childProfiles?.find(
      child => child.id === userProfile.activeProfile
    );
    return childProfile?.name || userProfile.displayName;
  };

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
          'transition-transform duration-300 ease-in-out',
          // Mobile: toggleable sidebar
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible, lower z-index
          'lg:translate-x-0 lg:z-30'
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
            
            {/* Switch Profile Link */}
            <div className="border-t border-light-gray pt-4 mt-4">
              <NavLink
                to="/profiles"
                onClick={() => window.innerWidth < 1024 && onClose()}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-medium-gray transition-colors hover:bg-light-gray"
              >
                <UserCheck className="h-5 w-5" />
                <span className="font-medium">Switch Profile</span>
              </NavLink>
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-light-gray p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-sunshine-yellow flex items-center justify-center text-white font-bold">
                {getCurrentDisplayName()?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-dark-slate">
                  {getCurrentDisplayName() || 'User'}
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