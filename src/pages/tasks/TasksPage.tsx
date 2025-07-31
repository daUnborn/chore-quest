import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { ViewTaskModal } from '@/components/tasks/ViewTaskModal';
import { PageHeader } from '@/components/layout/PageHeader';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { FAB } from '@/components/layout/FAB';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { Task, TaskStatus } from '@/types';
import { CreateTaskData } from '@/services/firebase/tasks.firebase.service';

export function TasksPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const {
    tasks,
    loading,
    error,
    createTask,
    updateTaskStatus,
    addPhotoProof,
    deleteTask
  } = useTasks();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus, completedBy?: string) => {
    try {
      await updateTaskStatus(taskId, newStatus, completedBy);
    } catch (error) {
      console.error('Failed to update task status:', error);
      // You could show a toast notification here
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleViewTask = (task: Task) => {
    setViewingTask(task);
  };

  const handlePhotoUpload = async (taskId: string, photo: File) => {
    try {
      // For now, create a mock URL - we'll implement Firebase Storage later
      const photoUrl = URL.createObjectURL(photo);
      await addPhotoProof(taskId, photoUrl);
      console.log('Photo uploaded for task:', taskId);
    } catch (error) {
      console.error('Failed to upload photo:', error);
      // You could show a toast notification here
    }
  };

  const handleCreateTask = async (taskData: CreateTaskData) => {
    try {
      await createTask(taskData);
      setShowCreateModal(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to create task:', error);
      // You could show a toast notification here
    }
  };

  const isParent = userProfile?.activeProfile === 'parent' || userProfile?.role === 'parent';

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-light-gray pb-20">
        <PageHeader title="Task Board" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pastel-blue"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-light-gray pb-20">
        <PageHeader title="Task Board" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-coral-accent mb-4">Error loading tasks: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-pastel-blue text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray pb-20">
      <PageHeader
        title="Task Board"
        rightActions={
          <span className="text-sm text-medium-gray">
            {tasks.filter(t => t.status !== 'archived').length} active tasks
          </span>
        }
      />

      <div className="p-4 h-[calc(100vh-8rem)]">
        <TaskBoard
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onPhotoUpload={handlePhotoUpload}
          onDelete={handleDeleteTask}
          onView={handleViewTask}
        />
      </div>

      {/* Only show FAB for parents */}
      {isParent && (
        <FAB
          onClick={() => setShowCreateModal(true)}
          icon={<Plus className="h-6 w-6" />}
          label="Add Task"
        />
      )}

      {/* Create/Edit Task Modal */}
      <CreateTaskModal
        isOpen={showCreateModal || !!editingTask}
        onClose={() => {
          setShowCreateModal(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateTask}
        editTask={editingTask}
      />

      {/* View Task Modal */}
      {viewingTask && (
        <ViewTaskModal
          isOpen={!!viewingTask}
          onClose={() => setViewingTask(null)}
          task={viewingTask}
        />
      )}
    </div>
  );
}