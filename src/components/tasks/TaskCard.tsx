import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, Camera } from 'lucide-react';
import { Task, TaskStatus } from '@/types';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import { PhotoUploadModal } from './PhotoUploadModal';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onPhotoUpload?: (taskId: string, photo: File) => void;
}

export function TaskCard({ task, onStatusChange, onPhotoUpload }: TaskCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const handleNextStatus = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Define status flow
    const statusFlow: Record<TaskStatus, TaskStatus> = {
      'todo': 'in-progress',
      'in-progress': 'review',
      'review': 'done',
      'done': 'archived',
      'archived': 'archived',
    };
    
    const nextStatus = statusFlow[task.status];
    
    // If moving to review and photo upload is required, show modal
    if (nextStatus === 'review' && onPhotoUpload && !task.photoProofUrl) {
      setShowPhotoModal(true);
      setIsAnimating(false);
      return;
    }
    
    // Animate and change status
    setTimeout(() => {
      onStatusChange(task.id, nextStatus);
      setIsAnimating(false);
    }, 300);
  };

  const handlePhotoUpload = (photo: File) => {
    if (onPhotoUpload) {
      onPhotoUpload(task.id, photo);
      // After upload, move to review status
      setTimeout(() => {
        onStatusChange(task.id, 'review');
      }, 500);
    }
    setShowPhotoModal(false);
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (task.status) {
      case 'todo': return '📋';
      case 'in-progress': return '🏃';
      case 'review': return '👀';
      case 'done': return '✅';
      case 'archived': return '📦';
      default: return '📋';
    }
  };

  const getDueDateColor = () => {
    const now = new Date();
    const dueDate = task.dueDate.toDate();
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'danger';
    if (diffDays === 0) return 'warning';
    return 'secondary';
  };

  const canAdvance = task.status !== 'done' && task.status !== 'archived';

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={{ y: -2 }}
        className={cn(
          'bg-white rounded-xl p-4 shadow-sm border-2 border-transparent',
          'hover:shadow-md transition-all duration-200',
          task.status === 'done' && 'opacity-75'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getStatusIcon()}</span>
            <h4 className="font-semibold text-dark-slate line-clamp-2">
              {task.title}
            </h4>
          </div>
          <Badge variant="primary" size="sm">
            {task.points} pts
          </Badge>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-medium-gray mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Assignee */}
        {task.assignedTo.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex -space-x-2">
              {task.assignedTo.slice(0, 3).map((userId, index) => (
                <div
                  key={userId}
                  className="w-6 h-6 rounded-full bg-pastel-blue flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                  style={{ zIndex: 3 - index }}
                >
                  {userId[0].toUpperCase()}
                </div>
              ))}
            </div>
            {task.assignedTo.length > 3 && (
              <span className="text-xs text-medium-gray">
                +{task.assignedTo.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Due Date */}
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-3 w-3 text-medium-gray" />
          <Badge variant={getDueDateColor()} size="sm">
            {format(task.dueDate.toDate(), 'MMM d, h:mm a')}
          </Badge>
        </div>

        {/* Status Button */}
        {canAdvance && (
          <motion.button
            onClick={handleNextStatus}
            disabled={isAnimating}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'w-full py-3 px-4 rounded-lg font-medium',
              'flex items-center justify-center gap-2',
              'transition-all duration-200',
              'bg-gradient-to-r hover:shadow-md',
              task.status === 'todo' && 'from-pastel-blue to-blue-400 text-white',
              task.status === 'in-progress' && 'from-mint-green to-green-400 text-white',
              task.status === 'review' && 'from-sunshine-yellow to-yellow-500 text-gray-800',
              task.status === 'done' && 'from-lavender-accent to-purple-400 text-white'
            )}
          >
            <span>
              {task.status === 'todo' && 'Start Task'}
              {task.status === 'in-progress' && 'Mark for Review'}
              {task.status === 'review' && 'Approve & Complete'}
              {task.status === 'done' && 'Archive'}
            </span>
            <motion.div
              animate={{ rotate: isAnimating ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.div>
          </motion.button>
        )}

        {/* Photo indicator for review */}
        {task.status === 'review' && task.photoProofUrl && (
          <div className="mt-2 flex items-center gap-1 text-xs text-medium-gray">
            <Camera className="h-3 w-3" />
            Photo proof attached
          </div>
        )}
      </motion.div>

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onUpload={handlePhotoUpload}
        taskTitle={task.title}
      />
    </>
  );
}