import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Trophy, Tag, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TASK_CATEGORIES, DEFAULT_TASK_POINTS } from '@/lib/constants/tasks';
import { useAuth } from '@/contexts/AuthContext';
import { Task } from '@/types';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void;
  editTask?: Task | null;
  householdMembers?: { id: string; name: string; role: 'parent' | 'child' }[];
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
  editTask,
  householdMembers = [],
}: CreateTaskModalProps) {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'chores',
    points: DEFAULT_TASK_POINTS.medium,
    assignedTo: [] as string[],
    dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    isRecurring: false,
  });

  useEffect(() => {
    if (editTask) {
      setFormData({
        title: editTask.title,
        description: editTask.description || '',
        category: editTask.category || 'chores',
        points: editTask.points,
        assignedTo: editTask.assignedTo,
        dueDate: format(editTask.dueDate.toDate(), "yyyy-MM-dd'T'HH:mm"),
        isRecurring: editTask.isRecurring,
      });
    } else {
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'chores',
        points: DEFAULT_TASK_POINTS.medium,
        assignedTo: [],
        dueDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        isRecurring: false,
      });
    }
  }, [editTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData: Partial<Task> = {
      ...formData,
      dueDate: Timestamp.fromDate(new Date(formData.dueDate)),
      status: editTask?.status || 'todo',
      createdBy: editTask?.createdBy || currentUser?.uid || '',
      createdAt: editTask?.createdAt || new Date(),
    };

    onSubmit(taskData);
    onClose();
  };

  const toggleAssignee = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(memberId)
        ? prev.assignedTo.filter(id => id !== memberId)
        : [...prev.assignedTo, memberId],
    }));
  };

  const quickSetPoints = (points: number) => {
    setFormData(prev => ({ ...prev, points }));
  };

  // Mock household members for testing
  const mockMembers = [
    { id: 'emma', name: 'Emma', role: 'child' as const },
    { id: 'jack', name: 'Jack', role: 'child' as const },
    { id: 'parent', name: 'Parent', role: 'parent' as const },
  ];

  const members = householdMembers.length > 0 ? householdMembers : mockMembers;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editTask ? 'Edit Task' : 'Create New Task'}
      size="md"
    >
      <div className="max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <Input
            label="Task Title"
            placeholder="e.g., Make bed, Do homework"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-dark-slate mb-1">
              Description (optional)
            </label>
            <textarea
              className="w-full rounded-lg border border-light-gray bg-white px-3 py-2 text-dark-slate resize-none focus:border-pastel-blue focus:outline-none focus:ring-2 focus:ring-pastel-blue focus:ring-opacity-20"
              rows={2}
              placeholder="Add any special instructions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-dark-slate mb-2">
              <Tag className="inline h-4 w-4 mr-1" />
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TASK_CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`p-2 rounded-lg border-2 transition-all text-center ${
                    formData.category === cat.value
                      ? 'border-pastel-blue bg-pastel-blue/10'
                      : 'border-light-gray hover:border-medium-gray'
                  }`}
                >
                  <div className="text-lg mb-1">{cat.icon}</div>
                  <div className="text-xs font-medium">{cat.label}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Assign To */}
          <div>
            <label className="block text-sm font-medium text-dark-slate mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Assign To
            </label>
            <div className="flex flex-wrap gap-2">
              {members.map((member) => (
                <motion.button
                  key={member.id}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleAssignee(member.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    formData.assignedTo.includes(member.id)
                      ? 'bg-pastel-blue text-white'
                      : 'bg-light-gray text-dark-slate hover:bg-medium-gray/20'
                  }`}
                >
                  {member.name}
                  {member.role === 'child' && ' 🧒'}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Due Date & Recurring */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Due Date & Time"
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              leftIcon={<Calendar className="h-4 w-4" />}
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-dark-slate mb-1">
                Recurring Task
              </label>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="w-4 h-4 text-pastel-blue rounded focus:ring-pastel-blue"
                />
                <span className="text-sm text-medium-gray">Repeat daily</span>
              </label>
            </div>
          </div>

          {/* Points */}
          <div>
            <label className="block text-sm font-medium text-dark-slate mb-2">
              <Trophy className="inline h-4 w-4 mr-1" />
              Points
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex gap-1">
                {Object.entries(DEFAULT_TASK_POINTS).map(([level, points]) => (
                  <Button
                    key={level}
                    type="button"
                    variant={formData.points === points ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => quickSetPoints(points)}
                    className="text-xs px-2 py-1"
                  >
                    {level} ({points})
                  </Button>
                ))}
              </div>
              <Input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                className="w-16 text-sm"
                min="1"
                max="100"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3 border-t sticky bottom-0 bg-white">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={!formData.title || formData.assignedTo.length === 0}
            >
              {editTask ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}