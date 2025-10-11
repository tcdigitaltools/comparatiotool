'use client';

import React from 'react';
import { Calculator, Upload, BarChart3 } from 'lucide-react';
import { useCalculatorContext } from '@/contexts/CalculatorContext';

interface CalculatorNavigationProps {
  section?: 'calculators' | 'analytics';
}

export function CalculatorNavigation({ section = 'calculators' }: CalculatorNavigationProps) {
  const { activeTab, setActiveTab } = useCalculatorContext();

  const calculatorItems = [
    {
      name: 'Individual',
      icon: Calculator,
      tab: 'individual' as const
    },
    {
      name: 'Bulk Upload',
      icon: Upload,
      tab: 'bulk' as const
    }
  ];

  const analyticsItems = [
    {
      name: 'Dashboard',
      icon: BarChart3,
      tab: 'dashboard' as const
    }
  ];

  const items = section === 'analytics' ? analyticsItems : calculatorItems;

  // Always show content - no collapsible functionality

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isActive = activeTab === item.tab;
        
        return (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.tab)}
            className={`flex items-center justify-center gap-3 px-3 py-2 text-sm font-medium rounded-full transition-colors w-full ${
              isActive
                ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white border border-white hover:from-brand-600 hover:to-brand-700'
                : 'bg-gradient-to-r from-brand-500 to-brand-600 text-white border border-white hover:from-brand-600 hover:to-brand-700'
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </button>
        );
      })}
    </div>
  );
}
