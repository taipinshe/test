
import { useState, useCallback, useMemo } from 'react';
import type { WizardStep, WizardOption, Answers, StatisticalMethod } from '../types';
import { STATISTICAL_METHODS } from '../data/methods';

export const useWizard = (steps: WizardStep[]) => {
  const [currentStepId, setCurrentStepId] = useState<string>('start');
  const [answers, setAnswers] = useState<Answers>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const currentStep = useMemo(() => 
    steps.find(step => step.id === currentStepId)!, 
    [currentStepId, steps]
  );
  
  const recommendedMethodId = useMemo(() => {
    if (!isCompleted) return null;
    const lastAnswerKey = Object.keys(answers).pop();
    if (!lastAnswerKey) return null;

    const lastStep = steps.find(s => s.id === lastAnswerKey);
    const lastOption = lastStep?.options.find(o => o.text === answers[lastAnswerKey]);
    return lastOption?.resultMethodId || null;
  }, [isCompleted, answers, steps]);

  const recommendedMethod = useMemo(() => 
    STATISTICAL_METHODS.find(method => method.id === recommendedMethodId) || null,
    [recommendedMethodId]
  );
  
  const handleAnswer = useCallback((option: WizardOption) => {
    setAnswers(prev => ({ ...prev, [currentStepId]: option.text }));

    if (option.nextStepId) {
      setCurrentStepId(option.nextStepId);
    } else {
      setIsCompleted(true);
    }
  }, [currentStepId]);

  const handleReset = useCallback(() => {
    setCurrentStepId('start');
    setAnswers({});
    setIsCompleted(false);
  }, []);

  return {
    currentStep,
    answers,
    isCompleted,
    handleAnswer,
    handleReset,
    recommendedMethod,
  };
};
