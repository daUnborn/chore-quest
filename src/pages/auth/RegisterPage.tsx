import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, loginWithGoogle, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    parentPin: '',
    confirmParentPin: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    clearError();
    setValidationError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    if (formData.parentPin.length !== 4) {
      setValidationError('Parent PIN must be exactly 4 digits');
      return;
    }

    if (formData.parentPin !== formData.confirmParentPin) {
      setValidationError('Parent PINs do not match');
      return;
    }

    setIsLoading(true);
    try {
      await register(formData.email, formData.password, formData.displayName, formData.parentPin);
      navigate('/onboarding');
    } catch (err) {
      // Error is handled in context
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate('/onboarding');
    } catch (err) {
      // Error is handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-green via-light-gray to-sunshine-yellow flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-dark-slate mb-2">
            Join Chore Quest!
          </h1>
          <p className="text-medium-gray">Start your family's adventure today</p>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-center mb-6">Create Account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Display Name"
              type="text"
              name="displayName"
              placeholder="John Doe"
              value={formData.displayName}
              onChange={handleChange}
              leftIcon={<User className="h-4 w-4" />}
              required
            />
            
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="parent@example.com"
              value={formData.email}
              onChange={handleChange}
              leftIcon={<Mail className="h-4 w-4" />}
              required
            />
            
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
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
              helperText="At least 6 characters"
              required
            />
            
            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              leftIcon={<Lock className="h-4 w-4" />}
              required
            />

<div className="grid grid-cols-2 gap-3">
              <Input
                label="Parent PIN"
                type="password"
                name="parentPin"
                placeholder="4-digit PIN"
                value={formData.parentPin}
                onChange={handleChange}
                maxLength={4}
                className="text-center text-lg tracking-widest"
                required
              />

              <Input
                label="Confirm PIN"
                type="password"
                name="confirmParentPin"
                placeholder="Confirm PIN"
                value={formData.confirmParentPin}
                onChange={handleChange}
                maxLength={4}
                className="text-center text-lg tracking-widest"
                required
              />
            </div>
            <p className="text-xs text-medium-gray text-center">
              This PIN will be used for profile management and secure actions
            </p>

            {(error || validationError) && (
              <p className="text-sm text-coral-accent text-center">
                {error || validationError}
              </p>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Create Account
            </Button>
          </form>

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
            onClick={handleGoogleRegister}
            disabled={isLoading}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Sign up with Google
          </Button>

          <p className="mt-6 text-center text-sm text-medium-gray">
            Already have an account?{' '}
            <Link to="/login" className="text-pastel-blue font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}