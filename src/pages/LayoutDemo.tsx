import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { FAB } from '@/components/layout/FAB';
import { EmptyState } from '@/components/layout/EmptyState';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, Filter, ClipboardList } from 'lucide-react';

function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        rightActions={
          <>
            <Button variant="ghost" size="sm">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Filter className="h-5 w-5" />
            </Button>
          </>
        }
      />
      <div className="p-4 space-y-4">
        <Card>
          <h2 className="text-lg font-semibold mb-2">Welcome to Chore Quest!</h2>
          <p className="text-medium-gray">
            This is the dashboard page with navigation components.
          </p>
        </Card>
        
        <Card>
          <h3 className="font-semibold mb-2">Today's Tasks</h3>
          <EmptyState
            icon={<ClipboardList className="h-12 w-12" />}
            title="No tasks yet"
            description="Create your first task to get started"
            action={{
              label: "Create Task",
              onClick: () => console.log('Create task clicked'),
            }}
          />
        </Card>
      </div>
      <FAB onClick={() => console.log('FAB clicked')} />
    </div>
  );
}

function TasksPage() {
  return (
    <div>
      <PageHeader title="Tasks" showBackButton />
      <div className="p-4">
        <Card>
          <h2 className="text-lg font-semibold">Tasks Page</h2>
          <p className="text-medium-gray mt-2">Task management will go here.</p>
        </Card>
      </div>
    </div>
  );
}

function RewardsPage() {
  return (
    <div>
      <PageHeader title="Rewards" />
      <div className="p-4">
        <Card>
          <h2 className="text-lg font-semibold">Rewards Shop</h2>
          <p className="text-medium-gray mt-2">Rewards will be displayed here.</p>
        </Card>
      </div>
    </div>
  );
}

function NotificationsPage() {
  return (
    <div>
      <PageHeader title="Notifications" />
      <div className="p-4">
        <Card>
          <h2 className="text-lg font-semibold">Notifications</h2>
          <p className="text-medium-gray mt-2">Your alerts will appear here.</p>
        </Card>
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" />
      <div className="p-4">
        <Card>
          <h2 className="text-lg font-semibold">Settings</h2>
          <p className="text-medium-gray mt-2">App settings and preferences.</p>
        </Card>
      </div>
    </div>
  );
}

export function LayoutDemo() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="rewards" element={<RewardsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}