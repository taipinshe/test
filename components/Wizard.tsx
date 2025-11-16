
import React from 'react';
import type { WizardStep, WizardOption } from '../types';

interface WizardProps {
  step: WizardStep;
  onAnswer: (option: WizardOption) => void;
}

export const Wizard: React.FC<WizardProps> = ({ step, onAnswer }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-700 mb-8 text-center">{step.question}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {step.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswer(option)}
            className="text-left p-6 bg-slate-100 rounded-lg hover:bg-blue-100 hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <p className="text-lg font-medium text-slate-800">{option.text}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
