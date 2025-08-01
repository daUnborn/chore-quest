import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

interface RewardsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function RewardsPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className
}: RewardsPaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, current page ± 1, and last page
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Results Info */}
      <p className="text-sm text-medium-gray">
        Showing {startItem}-{endItem} of {totalItems} rewards
      </p>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          leftIcon={<ChevronLeft className="h-4 w-4" />}
        >
          Previous
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-2 py-1 text-medium-gray">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className="w-8 h-8 p-0 flex items-center justify-center"
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          rightIcon={<ChevronRight className="h-4 w-4" />}
        >
          Next
        </Button>
      </div>

      {/* Quick Jump (for large datasets) */}
      {totalPages > 10 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-medium-gray">Jump to page:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page >= 1 && page <= totalPages) {
                onPageChange(page);
              }
            }}
            className="w-16 px-2 py-1 border border-light-gray rounded text-center text-sm"
          />
        </div>
      )}
    </div>
  );
}