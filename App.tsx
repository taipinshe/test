
import React, { useState } from 'react';
import { Header } from './components/Header';
import { Wizard } from './components/Wizard';
import { ResultDisplay } from './components/ResultDisplay';
import { useWizard } from './hooks/useWizard';
import type { StatisticalMethod } from './types';
import { WIZARD_STEPS } from './data/wizard';

const App: React.FC = () => {
  const {
    currentStep,
    answers,
    isCompleted,
    handleAnswer,
    handleReset,
    recommendedMethod,
  } = useWizard(WIZARD_STEPS);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl transition-all duration-500">
          {!isCompleted ? (
            <Wizard
              step={currentStep}
              onAnswer={handleAnswer}
            />
          ) : recommendedMethod ? (
            <ResultDisplay
              method={recommendedMethod}
              onReset={handleReset}
            />
          ) : (
             <div className="bg-white rounded-xl shadow-lg p-8 text-center">
               <h2 className="text-2xl font-bold text-slate-700 mb-4">找不到建議的方法</h2>
               <p className="text-slate-600 mb-6">根據您提供的答案，我們無法確定一個最適合的統計方法。請嘗試調整您的選擇。</p>
               <button
                  onClick={handleReset}
                  className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  重新開始
                </button>
             </div>
          )}
        </div>
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>為學術研究而設計，由 AI 驅動。</p>
      </footer>
    </div>
  );
};

export default App;
