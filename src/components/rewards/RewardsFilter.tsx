import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Calendar, User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils/cn';

export interface RewardFilters {
  dateRange: {
    start: string;
    end: string;
  };
  status: 'all' | 'pending' | 'approved' | 'rejected';
  userId: string | null;
  userName: string | null;
}

interface RewardsFilterProps {
  filters: RewardFilters;
  onFiltersChange: (filters: RewardFilters) => void;
  isParent: boolean;
  familyMembers: { id: string; name: string; avatar?: string }[];
  className?: string;
}

export function RewardsFilter({
  filters,
  onFiltersChange,
  isParent,
  familyMembers,
  className
}: RewardsFilterProps) {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilters, setTempFilters] = useState<RewardFilters>(filters);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    const today = getTodayDate();
    return (
      filters.dateRange.start !== today ||
      filters.dateRange.end !== today ||
      filters.status !== 'all' ||
      filters.userId !== null
    );
  };

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
    setShowFilterModal(false);
  };

  const handleResetFilters = () => {
    const today = getTodayDate();
    const resetFilters: RewardFilters = {
      dateRange: { start: today, end: today },
      status: 'all',
      userId: null,
      userName: null,
    };
    setTempFilters(resetFilters);
    onFiltersChange(resetFilters);
    setShowFilterModal(false);
  };

  const removeFilter = (filterType: 'dateRange' | 'status' | 'user') => {
    const today = getTodayDate();
    const newFilters = { ...filters };
    
    switch (filterType) {
      case 'dateRange':
        newFilters.dateRange = { start: today, end: today };
        break;
      case 'status':
        newFilters.status = 'all';
        break;
      case 'user':
        newFilters.userId = null;
        newFilters.userName = null;
        break;
    }
    
    onFiltersChange(newFilters);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'primary';
    }
  };

  return (
    <div className={cn('bg-white rounded-lg p-3', className)}>
      {/* Filter Button and Active Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setTempFilters(filters);
            setShowFilterModal(true);
          }}
          leftIcon={<Filter className="h-4 w-4" />}
          className="shrink-0"
        >
          Filters
        </Button>

        {/* Active Filter Chips */}
        <AnimatePresence>
          {/* Date Range Chip */}
          {(filters.dateRange.start !== getTodayDate() || filters.dateRange.end !== getTodayDate()) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Badge variant="primary" size="sm" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {filters.dateRange.start === filters.dateRange.end 
                  ? new Date(filters.dateRange.start).toLocaleDateString()
                  : `${new Date(filters.dateRange.start).toLocaleDateString()} - ${new Date(filters.dateRange.end).toLocaleDateString()}`
                }
                <button onClick={() => removeFilter('dateRange')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </motion.div>
          )}

          {/* Status Chip */}
          {filters.status !== 'all' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Badge variant={getStatusBadgeVariant(filters.status)} size="sm" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
                <button onClick={() => removeFilter('status')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </motion.div>
          )}

          {/* User Chip (Parent only) */}
          {isParent && filters.userId && filters.userName && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Badge variant="success" size="sm" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {filters.userName}
                <button onClick={() => removeFilter('user')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reset All Filters */}
        {hasActiveFilters() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-medium-gray hover:text-dark-slate"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Modal */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filter Rewards"
        size="md"
      >
        <div className="space-y-6">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-dark-slate mb-3">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="From"
                type="date"
                value={tempFilters.dateRange.start}
                onChange={(e) => setTempFilters({
                  ...tempFilters,
                  dateRange: { ...tempFilters.dateRange, start: e.target.value }
                })}
              />
              <Input
                label="To"
                type="date"
                value={tempFilters.dateRange.end}
                onChange={(e) => setTempFilters({
                  ...tempFilters,
                  dateRange: { ...tempFilters.dateRange, end: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-dark-slate mb-3">
              Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
              ].map((status) => (
                <Button
                  key={status.value}
                  variant={tempFilters.status === status.value ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setTempFilters({ ...tempFilters, status: status.value as any })}
                  className="justify-center"
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>

          {/* User Filter (Parent Only) */}
          {isParent && (
            <div>
              <label className="block text-sm font-medium text-dark-slate mb-3">
                Family Member
              </label>
              <div className="space-y-2">
                <Button
                  variant={tempFilters.userId === null ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setTempFilters({ 
                    ...tempFilters, 
                    userId: null, 
                    userName: null 
                  })}
                  fullWidth
                  className="justify-start"
                >
                  All Family Members
                </Button>
                {familyMembers.map((member) => (
                  <Button
                    key={member.id}
                    variant={tempFilters.userId === member.id ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setTempFilters({ 
                      ...tempFilters, 
                      userId: member.id,
                      userName: member.name
                    })}
                    fullWidth
                    className="justify-start flex items-center gap-2"
                  >
                    {member.avatar && (
                      <img 
                        src={member.avatar} 
                        alt={member.name}
                        className="w-5 h-5 rounded-full"
                      />
                    )}
                    {member.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => setShowFilterModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={handleResetFilters}
              fullWidth
            >
              Reset
            </Button>
            <Button
              variant="primary"
              onClick={handleApplyFilters}
              fullWidth
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}