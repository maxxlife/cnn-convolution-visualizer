import React from 'react';
import { Matrix } from '../types';

interface MathPanelProps {
  inputSlice: Matrix | null;
  kernel: Matrix;
  result: number | null;
  labels: {
    title: string;
    sum: string;
    explanation: string;
    placeholder: string;
  }
}

export const MathPanel: React.FC<MathPanelProps> = ({ inputSlice, kernel, result, labels }) => {
  if (!inputSlice || result === null) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-sm italic p-6 border-2 border-dashed border-slate-200 rounded-xl">
        {labels.placeholder}
      </div>
    );
  }

  // Flatten for display logic
  const steps: React.ReactElement[] = [];
  let sum = 0;

  for (let i = 0; i < kernel.length; i++) {
    for (let j = 0; j < kernel[0].length; j++) {
      const inVal = inputSlice[i][j];
      const kVal = kernel[i][j];
      const prod = inVal * kVal;
      sum += prod;

      steps.push(
        <div key={`${i}-${j}`} className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded border border-slate-100 min-w-[60px]">
          <div className="flex items-center space-x-1 text-xs sm:text-sm">
            <span className="text-blue-600 font-bold">{inVal}</span>
            <span className="text-slate-400">×</span>
            <span className="text-red-600 font-bold">{kVal}</span>
          </div>
          <div className="w-full h-px bg-slate-200 my-1"></div>
          <span className="font-mono font-medium text-slate-700">{prod}</span>
        </div>
      );
    }
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        {labels.title}
      </h3>
      
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {steps}
      </div>

      <div className="flex items-center justify-center space-x-4 pt-4 border-t border-slate-100">
        <span className="text-slate-500 uppercase text-sm font-semibold">{labels.sum}</span>
        <span className="text-3xl font-mono font-bold text-green-600">{sum}</span>
      </div>
      
      <p className="text-center text-xs text-slate-400 mt-2">
        {labels.explanation}
      </p>
    </div>
  );
};