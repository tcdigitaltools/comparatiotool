'use client';

import { useState, useEffect } from 'react';
import { Star, ChevronDown } from 'lucide-react';

interface PerformanceRatingScaleProps {
  currentScale?: string; // Expected format: "3/5" or "5/5"
  onScaleChange?: (newScale: string) => void; // Callback to update parent
}

// Conversion functions
const convertToDisplayFormat = (shortFormat: string): string => {
  switch (shortFormat) {
    case '3/5':
      return '3-Point Rating Scale';
    case '5/5':
      return '5-Point Rating Scale';
    default:
      return '5-Point Rating Scale';
  }
};

const convertToShortFormat = (displayFormat: string): string => {
  switch (displayFormat) {
    case '3-Point Rating Scale':
      return '3/5';
    case '5-Point Rating Scale':
      return '5/5';
    default:
      return '5/5';
  }
};

export default function PerformanceRatingScale({ 
  currentScale = "5/5",
  onScaleChange 
}: PerformanceRatingScaleProps) {
  const [selectedScale, setSelectedScale] = useState("5-Point Rating Scale"); // Default to prevent hydration mismatch
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const ratingScales = [
    "3-Point Rating Scale",
    "5-Point Rating Scale"
  ];

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    const displayFormat = convertToDisplayFormat(currentScale);
    setSelectedScale(displayFormat);
  }, [currentScale]);

  const handleScaleChange = (scale: string) => {
    setSelectedScale(scale);
    setIsDropdownOpen(false);
    
    // Convert to short format and notify parent
    const shortFormat = convertToShortFormat(scale);
    onScaleChange?.(shortFormat);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 flex items-center justify-center">
          <Star className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-brand-700">Performance Rating Scale</h2>
          <p className="text-brand-700 text-sm">Your company&apos;s performance evaluation scale</p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Rating Scale Dropdown */}
        <div className="space-y-2">
          <label className="text-brand-700 font-medium">Rating Scale Type:</label>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 border border-brand-200 rounded-lg hover:border-brand-300 transition-colors"
            >
              <span className="text-brand-700">{isClient ? selectedScale : "5-Point Rating Scale"}</span>
              <ChevronDown className={`h-4 w-4 text-brand-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                {ratingScales.map((scale) => {
                  const isSelected = isClient ? selectedScale === scale : scale === "5-Point Rating Scale";
                  return (
                    <button
                      key={scale}
                      onClick={() => handleScaleChange(scale)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-brand-50 transition-colors ${
                        isSelected ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700' : 'text-brand-700'
                      }`}
                    >
                      <span>{scale}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
