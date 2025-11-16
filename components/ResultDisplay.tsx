
import React from 'react';
import type { StatisticalMethod } from '../types';
import { GeminiChat } from './GeminiChat';

interface ResultDisplayProps {
  method: StatisticalMethod;
  onReset: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ method, onReset }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 animate-fade-in flex flex-col lg:flex-row gap-6 md:gap-8">
      <div className="lg:w-1/2 flex flex-col">
        <div className="flex-grow">
          <h3 className="text-sm font-bold uppercase text-blue-600 mb-2">建議的統計方法</h3>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">{method.name}</h2>
          <p className="text-slate-600 mb-6">{method.description}</p>
          
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-bold text-slate-700 mb-2">適用時機：</h4>
            <ul className="list-disc list-inside space-y-2 text-slate-600">
              {method.useWhen.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-slate-500 mt-4">{method.explanation}</p>
        </div>
        <button
          onClick={onReset}
          className="mt-8 w-full lg:w-auto bg-slate-200 text-slate-700 font-bold py-2 px-6 rounded-lg hover:bg-slate-300 transition-colors"
        >
          重新開始
        </button>
      </div>
      <div className="lg:w-1/2 lg:border-l lg:pl-8 border-slate-200">
        <GeminiChat method={method} />
      </div>
    </div>
  );
};
