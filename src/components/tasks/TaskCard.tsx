import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, Camera, MoreVertical, Trash2, Eye } from 'lucide-react';
import { Task, TaskStatus } from '@/types';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import { PhotoUploadModal } from './PhotoUploadModal';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/Button';

interface TaskCardProps {
    task: Task;
    onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
    onPhotoUpload?: (taskId: string, photo: File) => void;
    onDelete?: (taskId: string) => void;
    onView?: (task: Task) => void;
}

export function TaskCard({ task, onStatusChange, onPhotoUpload, onDelete, onView }: TaskCardProps) {
    const { userProfile } = useAuth();
    const [isAnimating, setIsAnimating] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
            // Make photo optional - directly move to review
            onStatusChange(task.id, nextStatus);
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

    const isOverdue = () => {
        const now = new Date();
        const dueDate = task.dueDate.toDate();
        return dueDate < now && task.status !== 'done' && task.status !== 'archived';
    };

    const getOverdueText = () => {
        const now = new Date();
        const dueDate = task.dueDate.toDate();
        const diffHours = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60));

        if (diffHours < 24) return `${diffHours}h overdue`;
        const diffDays = Math.ceil(diffHours / 24);
        return `${diffDays}d overdue`;
    };

    const canAdvance = task.status !== 'done' && task.status !== 'archived';
    const isChild = userProfile?.activeProfile !== 'parent';
    const canMoveToNext = canAdvance && !(isChild && task.status === 'review');

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ y: -2 }}
                className={cn(
                    'rounded-xl p-4 shadow-sm border-2 border-transparent',
                    'hover:shadow-md transition-all duration-200',
                    task.status === 'done' && 'opacity-75',
                    isOverdue() ? 'bg-red-50 border-red-200' : 'bg-white'
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
                    <div className="flex items-center gap-2">
                        <Badge variant="primary" size="sm">
                            {task.points} pts
                        </Badge>

                        {/* Actions Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowActions(!showActions)}
                                className="p-1 rounded-full hover:bg-gray-100"
                            >
                                <MoreVertical className="h-4 w-4 text-medium-gray" />
                            </button>

                            {showActions && (
                                <div className="absolute right-0 top-8 bg-white border border-light-gray rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                                    <button
                                        onClick={() => {
                                            onView?.(task);
                                            setShowActions(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Eye className="h-4 w-4" />
                                        View Details
                                    </button>

                                    {userProfile?.activeProfile === 'parent' && (
                                        <button
                                            onClick={() => {
                                                setShowDeleteConfirm(true);
                                                setShowActions(false);
                                            }}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-coral-accent"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete Task
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
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
                            {task.assignedTo.slice(0, 3).map((userId, index) => {
                                // Get the actual name for the user ID
                                const getAssigneeName = (id: string) => {
                                    if (id === 'parent') {
                                        return userProfile?.displayName || 'Parent';
                                    }
                                    // Find child profile
                                    const childProfile = userProfile?.childProfiles?.find(child => child.id === id);
                                    return childProfile?.name || id;
                                };

                                const assigneeName = getAssigneeName(userId);

                                return (
                                    <div
                                        key={userId}
                                        className="w-6 h-6 rounded-full bg-pastel-blue flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                                        style={{ zIndex: 3 - index }}
                                        title={assigneeName} // Tooltip showing full name
                                    >
                                        {assigneeName[0].toUpperCase()}
                                    </div>
                                );
                            })}
                        </div>
                        {task.assignedTo.length > 3 && (
                            <span className="text-xs text-medium-gray">
                                +{task.assignedTo.length - 3} more
                            </span>
                        )}
                    </div>
                )}

                {/* Due Date */}
                {/* Due Date */}
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-3 w-3 text-medium-gray" />
                    <Badge variant={getDueDateColor()} size="sm">
                        {isOverdue() ? getOverdueText() : format(task.dueDate.toDate(), 'MMM d, h:mm a')}
                    </Badge>
                    {isOverdue() && (
                        <Badge variant="danger" size="sm">
                            ⚠️ OVERDUE
                        </Badge>
                    )}
                </div>

                {/* Status Button */}
                {canMoveToNext && (
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
                            {task.status === 'review' && (isChild ? 'Waiting for Approval' : 'Approve & Complete')}
                            {task.status === 'done' && 'Archive'}
                        </span>
                        {!isChild && (
                            <motion.div
                                animate={{ rotate: isAnimating ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </motion.div>
                        )}
                    </motion.button>
                )}

                {/* Show message for children when task is in review */}
                {isChild && task.status === 'review' && (
                    <div className="w-full py-3 px-4 rounded-lg bg-gray-100 text-center">
                        <span className="text-medium-gray text-sm">
                            ⏳ Waiting for parent approval
                        </span>
                    </div>
                )}

                {/* Photo indicator for review */}
                {task.status === 'review' && task.photoProofUrl && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-medium-gray">
                        <Camera className="h-3 w-3" />
                        Photo proof attached
                    </div>
                )}
            </motion.div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-2">Delete Task</h3>
                        <p className="text-medium-gray mb-4">
                            Are you sure you want to delete "{task.title}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => {
                                    onDelete?.(task.id);
                                    setShowDeleteConfirm(false);
                                }}
                                className="flex-1"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

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