import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Copy, Check } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface OnboardingCompleteProps {
  onNext?: () => void;
}

export function OnboardingComplete({ onNext }: OnboardingCompleteProps) {
  const navigate = useNavigate();
  const { data } = useOnboarding();
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (data.householdCode) {
      navigator.clipboard.writeText(data.householdCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="mx-auto w-24 h-24 bg-mint-green rounded-full flex items-center justify-center"
      >
        <CheckCircle className="h-16 w-16 text-white" />
      </motion.div>

      <Card className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Welcome to {data.householdName}!</h2>
        <p className="text-medium-gray mb-6">
          You're all set! Let's start making chores fun.
        </p>

        {data.householdAction === 'create' && data.householdCode && (
          <div className="bg-light-gray rounded-lg p-4 mb-6">
            <p className="text-sm text-medium-gray mb-2">
              Share this code with your family:
            </p>
            <div className="flex items-center justify-center gap-2">
              <Badge size="md" variant="primary" className="text-lg font-mono">
                {data.householdCode}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyCode}
                className="ml-2"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-mint-green" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button
            fullWidth
            size="lg"
            onClick={() => navigate('/')}
          >
            Go to Dashboard
          </Button>
          
          <p className="text-xs text-medium-gray">
            Redirecting automatically in a few seconds...
          </p>
        </div>
      </Card>
    </div>
  );
}