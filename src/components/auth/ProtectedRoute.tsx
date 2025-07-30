import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresOnboarding?: boolean;
  requiresProfileSelection?: boolean;
}

export function ProtectedRoute({ children, requiresOnboarding = true, requiresProfileSelection = true }: ProtectedRouteProps) {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check if user needs onboarding (household setup)
  if (requiresOnboarding && userProfile && userProfile.householdIds.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  // Check if user needs to select profile
  if (requiresProfileSelection && userProfile && userProfile.householdIds.length > 0 && !userProfile.activeProfile) {
    return <Navigate to="/profiles" replace />;
  }

  return <>{children}</>;
}