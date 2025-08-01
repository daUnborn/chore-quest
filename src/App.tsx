import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage';
import { ProfileSelectionPage } from '@/pages/ProfileSelectionPage';
import { AppLayout } from '@/components/layout/AppLayout';
import { ParentDashboard } from '@/pages/dashboard/ParentDashboard';
import { ChildDashboard } from '@/pages/dashboard/ChildDashboard';
import { TasksPage } from '@/pages/tasks/TasksPage';
import { RewardsPage } from '@/pages/rewards/RewardsPage';
import { BadgesPage } from '@/pages/BadgesPage'; // New badges page
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';

// Dashboard router component
function DashboardRouter() {
  const { userProfile } = useAuth();

  // If activeProfile is 'parent', show parent dashboard
  // If activeProfile is a profile ID, show child dashboard
  if (userProfile?.activeProfile === 'parent') {
    return <ParentDashboard />;
  }

  // For any other profile (child profiles), show child dashboard
  return <ChildDashboard />;
}

function MainRouter() {
  const { userProfile, loading, currentUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pastel-blue"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If no household, redirect to onboarding
  if (!userProfile?.householdIds?.length) {
    return <Navigate to="/onboarding" replace />;
  }

  // If user has household but no active profile set, go to profile selection
  if (!userProfile.activeProfile) {
    return <Navigate to="/profiles" replace />;
  }

  // If user has both household and active profile, go to dashboard
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SidebarProvider>
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

            {/* Profile selection route */}
            <Route
              path="/profiles"
              element={
                <ProtectedRoute requiresOnboarding={false}>
                  <ProfileSelectionPage />
                </ProtectedRoute>
              }
            />

            {/* Main app entry point */}
            <Route
              path="/"
              element={
                <ProtectedRoute requiresOnboarding={false}>
                  <MainRouter />
                </ProtectedRoute>
              }
            />

            {/* Protected app routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <DashboardRouter />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TasksPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/rewards"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <RewardsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* New badges route */}
            <Route
              path="/badges"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <BadgesPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div>Notifications - Coming Soon</div>
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <div>Settings - Coming Soon</div>
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SidebarProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;