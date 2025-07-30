import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export function ForgotPasswordPage() {
  const { resetPassword, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await resetPassword(email);
      setIsSuccess(true);
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
        <Card className="p-6">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-pastel-blue hover:underline mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to login
          </Link>

          <h2 className="text-2xl font-semibold mb-2">Forgot Password?</h2>
          <p className="text-medium-gray mb-6">
            No worries! Enter your email and we'll send you reset instructions.
          </p>

          {!isSuccess ? (
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
                error={error || undefined}
                required
              />

              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isLoading}
                disabled={isLoading}
              >
                Send Reset Link
              </Button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-mint-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Check your email!</h3>
              <p className="text-medium-gray mb-6">
                We've sent password reset instructions to {email}
              </p>
              <Link to="/login">
                <Button variant="outline">Back to Login</Button>
              </Link>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}