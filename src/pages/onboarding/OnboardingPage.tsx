import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { HouseholdSetup } from './steps/HouseholdSetup';
import { OnboardingComplete } from './steps/OnboardingComplete';
import { useAuth } from '@/contexts/AuthContext';

const steps = [HouseholdSetup, OnboardingComplete];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  // Redirect if already onboarded
  useEffect(() => {
    if (userProfile && userProfile.householdIds.length > 0) {
      navigate('/');
    }
  }, [userProfile, navigate]);

  const CurrentStepComponent = steps[currentStep];

  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-gradient-to-br from-pastel-blue via-light-gray to-mint-green">
        <div className="min-h-screen flex items-center justify-center p-4">
          {/* Progress dots */}
          <div className="fixed top-8 left-1/2 -translate-x-1/2 flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-white'
                    : index < currentStep
                    ? 'bg-white bg-opacity-60'
                    : 'bg-white bg-opacity-30'
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-lg"
            >
              <CurrentStepComponent onNext={() => setCurrentStep(currentStep + 1)} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </OnboardingProvider>
  );
}