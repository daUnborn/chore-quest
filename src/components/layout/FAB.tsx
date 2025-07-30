import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface FABProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  hideOnScroll?: boolean;
  offset?: { bottom?: number; right?: number; left?: number };
}

export const FAB = forwardRef<HTMLButtonElement, FABProps>(
  (
    {
      icon = <Plus className="h-6 w-6" />,
      label,
      position = 'bottom-right',
      hideOnScroll = false,
      offset = { bottom: 80, right: 16, left: 16 },
      className,
      ...props
    },
    ref
  ) => {
    const positionClasses = {
      'bottom-right': 'bottom-20 right-4',
      'bottom-left': 'bottom-20 left-4',
      'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2',
    };

    return (
      <AnimatePresence>
        <motion.button
          ref={ref}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={cn(
            'fixed z-30 flex h-14 items-center gap-2 rounded-full bg-mint-green px-6 text-white shadow-fab transition-all hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-mint-green focus:ring-offset-2',
            positionClasses[position],
            className
          )}
          style={{
            bottom: `${offset.bottom}px`,
            ...(position === 'bottom-right' && { right: `${offset.right}px` }),
            ...(position === 'bottom-left' && { left: `${offset.left}px` }),
          }}
          {...props}
        >
          {icon}
          {label && <span className="font-semibold">{label}</span>}
        </motion.button>
      </AnimatePresence>
    );
  }
);

FAB.displayName = 'FAB';