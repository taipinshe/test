
import React from 'react';
import { ChartBarIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 md:px-8 flex items-center">
        <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
        <h1 className="text-2xl font-bold text-slate-800">
          研究統計導航
        </h1>
      </div>
    </header>
  );
};
