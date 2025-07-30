import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Gift, Bell, Settings } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/tasks', icon: ClipboardList, label: 'Tasks' },
  { to: '/rewards', icon: Gift, label: 'Rewards' },
  { to: '/notifications', icon: Bell, label: 'Alerts', badge: 3 },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-gray">
      <div className="flex h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'relative flex flex-1 flex-col items-center justify-center gap-1 text-medium-gray transition-colors',
                isActive && 'text-pastel-blue'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon className="h-6 w-6" />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-coral-accent text-xs text-white">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 h-0.5 w-12 -translate-x-1/2 bg-pastel-blue" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}