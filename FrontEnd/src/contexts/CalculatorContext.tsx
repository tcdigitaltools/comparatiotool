'use client';

import React, { createContext, useContext, useState } from 'react';

interface CalculatorContextType {
  activeTab: 'individual' | 'bulk' | 'dashboard';
  setActiveTab: (tab: 'individual' | 'bulk' | 'dashboard') => void;
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export function CalculatorProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<'individual' | 'bulk' | 'dashboard'>('individual');

  return (
    <CalculatorContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculatorContext() {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculatorContext must be used within a CalculatorProvider');
  }
  return context;
}
