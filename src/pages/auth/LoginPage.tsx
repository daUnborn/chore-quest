import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // Error is handled in context
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      // Error is handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-blue via-light-gray to-lavender-accent flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-dark-slate mb-2">
            Chore Quest
          </h1>
          <p className="text-medium-gray">Making chores fun for the whole family!</p>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-center mb-6">Welcome Back!</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="parent@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              leftIcon={<Mail className="h-4 w-4" />}
              required
            />
            
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              required
            />

            {error && (
              <p className="text-sm text-coral-accent text-center">{error}</p>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-pastel-blue hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-light-gray"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-medium-gray">Or continue with</span>
            </div>
          </div>

          <Button
            variant="outline"
            fullWidth
            size="lg"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Sign in with Google
          </Button>

          <p className="mt-6 text-center text-sm text-medium-gray">
            Don't have an account?{' '}
            <Link to="/register" className="text-pastel-blue font-medium hover:underline">
              Sign up for free
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}