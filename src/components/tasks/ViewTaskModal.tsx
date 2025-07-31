import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Trophy, Tag, Camera } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Task } from '@/types';
import { TASK_CATEGORIES } from '@/lib/constants/tasks';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface ViewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

export function ViewTaskModal({ isOpen, onClose, task }: ViewTaskModalProps) {
  const { userProfile } = useAuth();

  const getCategory = () => {
    return TASK_CATEGORIES.find(cat => cat.value === task.category) || 
           { label: 'Other', icon: '⭐', value: 'other' };
  };

  const getHouseholdMembers = () => {
    const members: { id: string; name: string; role: 'parent' | 'child' }[] = [];

    if (userProfile) {
      members.push({
        id: 'parent',
        name: userProfile.displayName,
        role: 'parent'
      });
    }

    if (userProfile?.childProfiles) {
      userProfile.childProfiles.forEach(child => {
        members.push({
          id: child.id,
          name: child.name,
          role: 'child'
        });
      });
    }

    return members;
  };

  const members = getHouseholdMembers();
  const category = getCategory();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
      size="md"
    >
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-dark-slate mb-1">
            Task Title
          </label>
          <div className="p-3 bg-light-gray rounded-lg">
            <p className="text-dark-slate font-medium">{task.title}</p>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div>
            <label className="block text-sm font-medium text-dark-slate mb-1">
              Description
            </label>
            <div className="p-3 bg-light-gray rounded-lg">
              <p className="text-dark-slate">{task.description}</p>
            </div>
          </div>
        )}

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-dark-slate mb-2">
            <Tag className="inline h-4 w-4 mr-1" />
            Category
          </label>
          <div className="flex items-center gap-2">
            <span className="text-lg">{category.icon}</span>
            <Badge variant="secondary">{category.label}</Badge>
          </div>
        </div>

        {/* Assigned To */}
        <div>
          <label className="block text-sm font-medium text-dark-slate mb-2">
            <Users className="inline h-4 w-4 mr-1" />
            Assigned To
          </label>
          <div className="flex flex-wrap gap-2">
            {task.assignedTo.map((memberId) => {
              const member = members.find(m => m.id === memberId);
              return (
                <Badge key={memberId} variant="primary">
                  {member?.name || memberId}
                  {member?.role === 'parent' && ' 👨‍👩‍👧‍👦'}
                  {member?.role === 'child' && ' 🧒'}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-dark-slate mb-1">
            <Calendar className="inline h-4 w-4 mr-1" />
            Due Date & Time
          </label>
          <div className="p-3 bg-light-gray rounded-lg">
            <p className="text-dark-slate">
              {format(task.dueDate.toDate(), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
            </p>
          </div>
        </div>

        {/* Points */}
        <div>
          <label className="block text-sm font-medium text-dark-slate mb-1">
            <Trophy className="inline h-4 w-4 mr-1" />
            Points
          </label>
          <div className="p-3 bg-light-gray rounded-lg">
            <Badge variant="warning" size="sm">{task.points} points</Badge>
          </div>
        </div>

{/* Recurring */}
        {task.isRecurring && (
          <div>
            <label className="block text-sm font-medium text-dark-slate mb-1">
              Recurring Pattern
            </label>
            <div className="p-3 bg-light-gray rounded-lg space-y-2">
              <Badge variant="primary" className="capitalize">
                {task.recurringPattern?.frequency || 'daily'} Task
              </Badge>
              
              {task.recurringPattern?.frequency === 'weekly' && task.recurringPattern?.daysOfWeek && (
                <div className="flex gap-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-full text-xs flex items-center justify-center ${
                        task.recurringPattern?.daysOfWeek?.includes(index)
                          ? 'bg-pastel-blue text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {day[0]}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Photo Proof */}
        {task.photoProofUrl && (
          <div>
            <label className="block text-sm font-medium text-dark-slate mb-2">
              <Camera className="inline h-4 w-4 mr-1" />
              Photo Proof
            </label>
            <img
              src={task.photoProofUrl}
              alt="Task proof"
              className="w-full h-40 object-cover rounded-lg border border-light-gray"
            />
          </div>
        )}

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-dark-slate mb-1">
            Current Status
          </label>
          <div className="p-3 bg-light-gray rounded-lg">
            <Badge variant="secondary">{task.status.replace('-', ' ')}</Badge>
          </div>
        </div>
      </div>
    </Modal>
  );
}