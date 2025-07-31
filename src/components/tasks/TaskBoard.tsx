import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Task, TaskStatus } from '@/types';
import { TASK_COLUMNS } from '@/lib/constants/tasks';
import { TaskCard } from './TaskCard';
import { DraggableTaskCard } from './DraggableTaskCard';
import { MobileDroppableAccordion } from './MobileDroppableAccordion';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import confetti from 'canvas-confetti';
import { useAuth } from '@/contexts/AuthContext';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
interface TaskBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus, completedBy?: string) => void;
  onPhotoUpload?: (taskId: string, photo: File) => void;
  onDelete?: (taskId: string) => void;
  onView?: (task: Task) => void;
}
interface FilterState {
  assignee: string | null;
  dueToday: boolean;
  streakTasks: boolean;
}

function DroppableColumn({ column, children }: { column: any; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
  });

  // Count tasks by counting the children in the SortableContext
  const getTaskCount = () => {
    if (!children) return 0;
    // Find the SortableContext child and count its children
    const sortableContext = React.Children.toArray(children)[0];
    if (React.isValidElement(sortableContext)) {
      const taskContainer = sortableContext.props.children;
      if (React.isValidElement(taskContainer)) {
        const animatePresence = taskContainer.props.children;
        if (React.isValidElement(animatePresence)) {
          return React.Children.count(animatePresence.props.children);
        }
      }
    }
    return 0;
  };

  return (
    <div className="flex-1 min-w-[280px]">
      {/* Column Header */}
      <div 
        ref={setNodeRef}
        className={cn(
          'rounded-t-lg p-3 mb-3 transition-all',
          column.color,
          'text-white font-semibold text-center',
          isOver && 'ring-2 ring-white ring-opacity-50 scale-105'
        )}
      >
        {column.title}
      </div>
      
      {children}
    </div>
  );
}

export function TaskBoard({ tasks, onStatusChange, onPhotoUpload, onDelete, onView }: TaskBoardProps) {
  const { userProfile } = useAuth();
  const [filters, setFilters] = useState<FilterState>({
    assignee: null,
    dueToday: false,
    streakTasks: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [expandedColumns, setExpandedColumns] = useState<Set<TaskStatus>>(new Set(['todo'])); // Default expand 'todo'

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 15, // Increase distance to prevent accidental drags
        delay: 200, // Add delay for mobile
        tolerance: 5,
      },
    })
  );

  // Get household members for filter dropdown
  const getHouseholdMembers = () => {
    const members: { id: string; name: string }[] = [];

    // Add parent
    if (userProfile) {
      members.push({
        id: 'parent',
        name: userProfile.displayName
      });
    }

    // Add child profiles
    if (userProfile?.childProfiles) {
      userProfile.childProfiles.forEach(child => {
        members.push({
          id: child.id,
          name: child.name
        });
      });
    }

    return members;
  };

  const householdMembers = getHouseholdMembers();

  // Group tasks by status
  const tasksByStatus = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  // Handle drag events
  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    console.log('Drag ended - Active:', active.id, 'Over:', over?.id);

    if (!over) {
      console.log('No drop target - task stays in place');
      return;
    }

    const taskId = active.id as string;
    const dropTargetId = over.id as string;

    // Validate that the drop target is a valid column
    const validStatuses = TASK_COLUMNS.map(col => col.id);
    if (!validStatuses.includes(dropTargetId as TaskStatus)) {
      console.log('Invalid drop target:', dropTargetId, 'Valid targets:', validStatuses);
      return; // Don't update if dropped on invalid target
    }

    // Only update if status actually changed
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== dropTargetId) {
      console.log('Moving task from', task.status, 'to', dropTargetId);
      handleStatusChange(taskId, dropTargetId as TaskStatus);
    } else {
      console.log('Task status unchanged or task not found');
    }
  };

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
    
    // Determine who should be credited for completion
    const task = tasks.find(t => t.id === taskId);
    let completedBy = userProfile?.activeProfile;
    
    // If parent is approving a task assigned to a child, credit the child
    if (newStatus === 'done' && 
        userProfile?.activeProfile === 'parent' && 
        task?.assignedTo.length === 1 && 
        task.assignedTo[0] !== 'parent') {
      completedBy = task.assignedTo[0]; // Credit the assigned child
    }
    
    onStatusChange(taskId, newStatus, completedBy);
  };

  // Apply filters
  const filteredTasks = (columnTasks: Task[]) => {
    return columnTasks.filter(task => {
      // Assignee filter
      if (filters.assignee && !task.assignedTo.includes(filters.assignee)) {
        return false;
      }
      
      // Due today filter
      if (filters.dueToday) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const taskDate = task.dueDate.toDate();
        if (taskDate < today || taskDate >= tomorrow) {
          return false;
        }
      }
      
      // Streak tasks filter (recurring tasks)
      if (filters.streakTasks && !task.isRecurring) {
        return false;
      }
      
      return true;
    });
  };

  const removeFilter = (filterKey: keyof FilterState) => {
    setFilters(prev => ({ ...prev, [filterKey]: filterKey === 'dueToday' || filterKey === 'streakTasks' ? false : null }));
  };

  // Toggle accordion column
  const toggleColumn = (columnId: TaskStatus) => {
    setExpandedColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        newSet.delete(columnId);
      } else {
        newSet.add(columnId);
      }
      return newSet;
    });
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
                    Assignee: {householdMembers.find(m => m.id === filters.assignee)?.name || filters.assignee}
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
              {filters.streakTasks && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Badge variant="success" size="sm" className="flex items-center gap-1">
                    Recurring Tasks
                    <button onClick={() => removeFilter('streakTasks')}>
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
            className="mt-3 pt-3 border-t border-medium-gray/20 space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFilters(prev => ({ ...prev, dueToday: !prev.dueToday }))}
                className={`p-2 rounded-lg text-sm transition-all ${
                  filters.dueToday 
                    ? 'bg-sunshine-yellow text-white' 
                    : 'bg-white border border-light-gray hover:bg-gray-50'
                }`}
              >
                📅 Due Today
              </button>
              
              <button
                onClick={() => setFilters(prev => ({ ...prev, streakTasks: !prev.streakTasks }))}
                className={`p-2 rounded-lg text-sm transition-all ${
                  filters.streakTasks 
                    ? 'bg-coral-accent text-white' 
                    : 'bg-white border border-light-gray hover:bg-gray-50'
                }`}
              >
                🔄 Recurring Tasks
              </button>
            </div>
            
            {/* Assignee Filter */}
            <div>
              <label className="block text-xs font-medium text-medium-gray mb-1">
                Filter by Assignee
              </label>
              <select
                value={filters.assignee || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  assignee: e.target.value || null 
                }))}
                className="w-full p-2 rounded-lg border border-light-gray text-sm"
              >
                <option value="">All Members</option>
                {householdMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </div>

      {/* Task Columns */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Mobile Accordion View */}
        <div className="flex-1 block md:hidden space-y-2">
          {TASK_COLUMNS.map((column) => {
            const columnTasks = filteredTasks(tasksByStatus[column.id] || []);
            
            return (
              <MobileDroppableAccordion
                key={column.id}
                column={column}
                tasks={columnTasks}
                isExpanded={expandedColumns.has(column.id)}
                onToggle={() => toggleColumn(column.id)}
                onStatusChange={handleStatusChange}
                onPhotoUpload={onPhotoUpload}
                onDelete={onDelete}
                onView={onView}
              />
            );
          })}
        </div>

        {/* Desktop View - Horizontal Columns */}
        <div className="hidden md:flex flex-1 gap-4 overflow-x-auto pb-4">
          {TASK_COLUMNS.map((column) => {
            const columnTasks = filteredTasks(tasksByStatus[column.id] || []);
            
            return (
              <DroppableColumn key={column.id} column={column}>
                <SortableContext
                  items={columnTasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 min-h-[200px]">
                    <AnimatePresence>
                      {columnTasks.map((task) => (
                        <DraggableTaskCard
                          key={task.id}
                          task={task}
                          onStatusChange={handleStatusChange}
                          onPhotoUpload={onPhotoUpload}
                          onDelete={onDelete}
                          onView={onView}
                        />
                      ))}
                    </AnimatePresence>

                    {/* Empty state */}
                    {columnTasks.length === 0 && (
                      <div className="text-center py-8 text-medium-gray text-sm">
                        No tasks here
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DroppableColumn>
            );
          })}
        </div>

        {/* Drag Overlay */}
        <DragOverlay
          style={{
            transformOrigin: 'top left',
          }}
          dropAnimation={{
            duration: 300,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}
        >
          {activeTask ? (
            <div className="transform rotate-2 scale-105 shadow-2xl">
              <TaskCard
                task={activeTask}
                onStatusChange={() => {}}
                onPhotoUpload={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}