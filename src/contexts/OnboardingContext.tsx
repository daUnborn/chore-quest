import { createContext, useContext, useState } from 'react';

interface OnboardingData {
  role: 'parent' | 'child' | null;
  householdAction: 'create' | 'join' | null;
  householdCode?: string;
  householdName?: string;
  childAge?: number;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    role: null,
    householdAction: null,
  });

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => Math.max(0, prev - 1));
  const reset = () => {
    setCurrentStep(0);
    setData({ role: null, householdAction: null });
  };

  return (
    <OnboardingContext.Provider
      value={{ data, updateData, currentStep, setCurrentStep, nextStep, prevStep, reset }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}