import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { FAB } from '@/components/layout/FAB';
import { useAuth } from '@/contexts/AuthContext';
import { Task, TaskStatus } from '@/types';
import { Timestamp } from 'firebase/firestore';

// Mock data for testing
const mockTasks: Task[] = [
  {
    id: '1',
    householdId: 'household1',
    title: 'Make bed',
    assignedTo: ['Emma'],
    createdBy: 'parent1',
    createdAt: new Date(),
    dueDate: Timestamp.fromDate(new Date()),
    points: 5,
    status: 'todo',
    category: 'morning',
    isRecurring: false,
  },
  {
    id: '2',
    householdId: 'household1',
    title: 'Do homework',
    assignedTo: ['Jack'],
    createdBy: 'parent1',
    createdAt: new Date(),
    dueDate: Timestamp.fromDate(new Date()),
    points: 10,
    status: 'in-progress',
    category: 'homework',
    isRecurring: false,
  },
  {
    id: '3',
    householdId: 'household1',
    title: 'Clean room',
    assignedTo: ['Emma', 'Jack'],
    createdBy: 'parent1',
    createdAt: new Date(),
    dueDate: Timestamp.fromDate(new Date()),
    points: 8,
    status: 'review',
    category: 'chores',
    isRecurring: false,
    photoProofUrl: 'https://example.com/photo.jpg',
  },
];

export function TasksPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { 
              ...task, 
              status: newStatus,
              ...(newStatus === 'done' ? { completedAt: new Date() } : {})
            }
          : task
      )
    );
  };

  const handlePhotoUpload = (taskId: string, photo: File) => {
    // In real app, upload to Firebase Storage
    console.log('Photo upload for task:', taskId, photo);
    
    // For now, just update the task with a mock URL
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, photoProofUrl: URL.createObjectURL(photo) }
          : task
      )
    );
  };

  const handleCreateTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      householdId: userProfile?.householdIds[0] || 'household1',
      title: taskData.title!,
      description: taskData.description,
      assignedTo: taskData.assignedTo!,
      createdBy: taskData.createdBy!,
      createdAt: new Date(),
      dueDate: taskData.dueDate!,
      points: taskData.points!,
      status: 'todo',
      category: taskData.category,
      isRecurring: taskData.isRecurring!,
    };

    if (editingTask) {
      // Update existing task
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === editingTask.id
            ? { ...task, ...taskData }
            : task
        )
      );
    } else {
      // Add new task
      setTasks(prevTasks => [...prevTasks, newTask]);
    }

    setEditingTask(null);
  };

  const isParent = userProfile?.role === 'parent';

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
    </div>
  );
}