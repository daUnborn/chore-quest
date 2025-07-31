import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskStatus, Task } from '@/types';
import { DraggableTaskCard } from './DraggableTaskCard';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';

interface MobileDroppableAccordionProps {
    column: { id: TaskStatus; title: string; color: string };
    tasks: Task[];
    isExpanded: boolean;
    onToggle: () => void;
    onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
    onPhotoUpload?: (taskId: string, photo: File) => void;
    onDelete?: (taskId: string) => void;
    onView?: (task: Task) => void;
}

export function MobileDroppableAccordion({
    column,
    tasks,
    isExpanded,
    onToggle,
    onStatusChange,
    onPhotoUpload,
    onDelete,
    onView,
}: MobileDroppableAccordionProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: column.id,
    });

    return (
        <motion.div
            layout
            className={cn(
                'bg-white rounded-lg shadow-sm border overflow-hidden transition-all',
                isOver ? 'border-pastel-blue ring-2 ring-pastel-blue ring-opacity-20' : 'border-light-gray'
            )}
        >
            {/* Accordion Header */}
            <div 
              className="p-4 space-y-3 min-h-[100px]"
            >
                <button
                    onClick={onToggle}
                    className={cn(
                        'w-full p-4 flex items-center justify-between transition-all relative z-10',
                        column.color,
                        'text-white font-semibold'
                    )}
                >
                    <div className="flex items-center gap-3">
                        <span>{column.title}</span>
                        <Badge variant="secondary" size="sm" className="bg-white/20 text-white">
                            {tasks.length}
                        </Badge>
                    </div>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="h-5 w-5" />
                    </motion.div>
                </button>
                {isOver && !isExpanded && (
                    <div className="absolute inset-0 bg-white/10 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Drop here</span>
                    </div>
                )}
            </div>
            {/* Accordion Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div
                            ref={setNodeRef}
                            className={cn(
                                'p-4 space-y-3 min-h-[100px] transition-all',
                                isOver && 'bg-pastel-blue/5'
                            )}
                        >
                            <SortableContext
                                items={tasks.map(t => t.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <AnimatePresence>
                                    {tasks.map((task) => (
                                        <DraggableTaskCard
                                            key={task.id}
                                            task={task}
                                            onStatusChange={onStatusChange}
                                            onPhotoUpload={onPhotoUpload}
                                            onDelete={onDelete}
                                            onView={onView}
                                        />
                                    ))}
                                </AnimatePresence>
                            </SortableContext>

                            {/* Empty state */}
                            {tasks.length === 0 && (
                                <div className="text-center py-8 text-medium-gray text-sm">
                                    No {column.title.toLowerCase()} tasks
                                    {isOver && (
                                        <div className="mt-2 text-pastel-blue text-xs">
                                            Drop task here
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}