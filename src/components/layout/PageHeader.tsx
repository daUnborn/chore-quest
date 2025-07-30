import { useNavigate } from 'react-router-dom';
import { Menu, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { useSidebar } from '@/contexts/SidebarContext';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  rightActions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  showBackButton = false,
  showMenuButton = true,
  rightActions,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-14 items-center justify-between bg-white px-4 shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-2">
        {showBackButton ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="-ml-2"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        ) : showMenuButton ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="-ml-2"
          >
            <Menu className="h-6 w-6" />
          </Button>
        ) : null}
        <h1 className="text-xl font-semibold text-dark-slate line-clamp-1">
          {title}
        </h1>
      </div>
      {rightActions && (
        <div className="flex items-center gap-2">{rightActions}</div>
      )}
    </header>
  );
}