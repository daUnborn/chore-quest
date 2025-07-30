import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage';
import { AppLayout } from '@/components/layout/AppLayout';
import { ParentDashboard } from '@/pages/dashboard/ParentDashboard';
import { ChildDashboard } from '@/pages/dashboard/ChildDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { TasksPage } from '@/pages/tasks/TasksPage';
import { RewardsPage } from '@/pages/rewards/RewardsPage';

// Dashboard router component
function DashboardRouter() {
  const { userProfile } = useAuth();
  
  // Show appropriate dashboard based on user role
  if (userProfile?.role === 'child') {
    return <ChildDashboard />;
  }
  
  return <ParentDashboard />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Onboarding route */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requiresOnboarding={false}>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* task routes*/}
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/rewards" element={<RewardsPage />} />

          {/* Protected app routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<DashboardRouter />} />
                    <Route path="/tasks" element={<div>Tasks Page - Coming Soon</div>} />
                    <Route path="/rewards" element={<div>Rewards Page - Coming Soon</div>} />
                    <Route path="/notifications" element={<div>Notifications - Coming Soon</div>} />
                    <Route path="/settings" element={<div>Settings - Coming Soon</div>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;