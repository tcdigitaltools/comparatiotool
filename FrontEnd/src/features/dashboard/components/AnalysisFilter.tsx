'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface AnalysisFilterProps {
  title: string;
  type: 'salary' | 'percentage';
  placeholder: string;
  onFilter: (from?: number, to?: number) => void;
  isLoading: boolean;
}

export const AnalysisFilter: React.FC<AnalysisFilterProps> = ({
  title,
  placeholder,
  onFilter,
  isLoading
}) => {
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');

  const handleShowResults = () => {
    const from = fromValue.trim() ? parseFloat(fromValue.trim()) : undefined;
    const to = toValue.trim() ? parseFloat(toValue.trim()) : undefined;
    
    // Validate that at least one value is provided
    if (from === undefined && to === undefined) {
      return;
    }
    
    // Validate that from is not greater than to
    if (from !== undefined && to !== undefined && from > to) {
      return;
    }
    
    onFilter(from, to);
  };

  const hasValidInput = (fromValue.trim() || toValue.trim()) && 
    (!fromValue.trim() || !toValue.trim() || parseFloat(fromValue.trim()) <= parseFloat(toValue.trim()));

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-brand-200 p-6">
      <h2 className="text-xl font-semibold text-brand-700 mb-6 uppercase">
        {title}
      </h2>
      
      <div className="space-y-10">
        {/* From and To Inputs - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-base font-medium text-brand-600 mb-2 ml-1">
              From
            </label>
            <input
              type="number"
              value={fromValue}
              onChange={(e) => setFromValue(e.target.value)}
              placeholder={`From ${placeholder}`}
              className="w-full px-4 py-3 border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-brand-700 placeholder:text-gray-400 placeholder:text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-base font-medium text-brand-600 mb-2 ml-1">
              To
            </label>
            <input
              type="number"
              value={toValue}
              onChange={(e) => setToValue(e.target.value)}
              placeholder={`To ${placeholder}`}
              className="w-full px-4 py-3 border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-brand-700 placeholder:text-gray-400 placeholder:text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              disabled={isLoading}
            />
          </div>
        </div>
        
        {/* Show Results Button */}
        <button
          onClick={handleShowResults}
          disabled={isLoading || !hasValidInput}
          className="w-full px-6 py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 font-medium text-sm flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          Show Results
        </button>
      </div>
    </div>
  );
};
