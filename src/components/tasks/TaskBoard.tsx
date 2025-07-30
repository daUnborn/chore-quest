import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import { Task, TaskStatus } from '@/types';
import { TASK_COLUMNS } from '@/lib/constants/tasks';
import { TaskCard } from './TaskCard';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import confetti from 'canvas-confetti';

interface TaskBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onPhotoUpload?: (taskId: string, photo: File) => void;
}

interface FilterState {
  assignee: string | null;
  dueToday: boolean;
  streakTasks: boolean;
}

export function TaskBoard({ tasks, onStatusChange, onPhotoUpload }: TaskBoardProps) {
  const [filters, setFilters] = useState<FilterState>({
    assignee: null,
    dueToday: false,
    streakTasks: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Group tasks by status
  const tasksByStatus = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  // Handle status change with confetti
  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    // Trigger confetti when task is completed
    if (newStatus === 'done') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#5DADE2', '#48C9B0', '#F4D03F', '#AF7AC5'],
      });
    }
    
    onStatusChange(taskId, newStatus);
  };

  // Apply filters
  const filteredTasks = (columnTasks: Task[]) => {
    return columnTasks.filter(task => {
      if (filters.assignee && !task.assignedTo.includes(filters.assignee)) {
        return false;
      }
      if (filters.dueToday) {
        const today = new Date().toDateString();
        const taskDate = task.dueDate.toDate().toDateString();
        if (today !== taskDate) return false;
      }
      // Add more filter logic as needed
      return true;
    });
  };

  const removeFilter = (filterKey: keyof FilterState) => {
    setFilters(prev => ({ ...prev, [filterKey]: filterKey === 'dueToday' || filterKey === 'streakTasks' ? false : null }));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Filter Bar */}
      <div className={cn(
        'bg-light-gray rounded-lg p-3 mb-4 transition-all duration-300',
        showFilters ? 'h-auto' : 'h-12'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm text-medium-gray hover:text-dark-slate"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            
            {/* Active filter chips */}
            <AnimatePresence>
              {filters.assignee && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Badge variant="primary" size="sm" className="flex items-center gap-1">
                    Assignee: {filters.assignee}
                    <button onClick={() => removeFilter('assignee')}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                </motion.div>
              )}
              {filters.dueToday && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Badge variant="warning" size="sm" className="flex items-center gap-1">
                    Due Today
                    <button onClick={() => removeFilter('dueToday')}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Expanded filter options */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-medium-gray/20"
          >
            {/* Add filter options here */}
            <p className="text-sm text-medium-gray">Filter options coming soon...</p>
          </motion.div>
        )}
      </div>

      {/* Task Columns */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {TASK_COLUMNS.map((column) => (
          <div key={column.id} className="flex-1 min-w-[280px]">
            {/* Column Header */}
            <div className={cn(
              'rounded-t-lg p-3 mb-3',
              column.color,
              'text-white font-semibold text-center'
            )}>
              {column.title} ({filteredTasks(tasksByStatus[column.id] || []).length})
            </div>
            
            {/* Column Tasks */}
            <div className="space-y-3 min-h-[200px]">
              <AnimatePresence>
                {filteredTasks(tasksByStatus[column.id] || []).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    onPhotoUpload={onPhotoUpload}
                  />
                ))}
              </AnimatePresence>
              
              {/* Empty state */}
              {(!tasksByStatus[column.id] || tasksByStatus[column.id].length === 0) && (
                <div className="text-center py-8 text-medium-gray text-sm">
                  No tasks here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}