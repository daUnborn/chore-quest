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

  // ... rest of the component remains the same ...

  return (
    <>
      <motion.div
        // ... existing card content ...
      >
        {/* ... existing card content ... */}
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