import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary';
  titleSize?: 'small' | 'medium' | 'xsmall';
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon,
  variant = 'default',
  titleSize = 'small'
}) => {
  const isPrimary = variant === 'primary';

  return (
    <div
      className={`
        rounded-2xl p-4 shadow-sm border transition-all duration-300 hover:shadow-md h-20 flex flex-col justify-between
        ${isPrimary 
          ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white border-brand-500' 
          : 'bg-white border-brand-200'
        }
      `}
    >
      <div className="relative flex-1">
        {/* Small icon in top-right corner */}
        {icon && (
          <div className="absolute top-0 right-0">
            <div className={`w-3 h-3 ${isPrimary ? 'text-white' : 'text-brand-600'}`}>
              {icon}
            </div>
          </div>
        )}
        
        {/* Title and Value */}
        <div className="pr-4 h-full flex flex-col justify-between">
          <p className={`${titleSize === 'medium' ? 'text-[10px]' : titleSize === 'xsmall' ? 'text-[9px]' : 'text-[10px]'} font-medium leading-tight break-words ${isPrimary ? 'text-white/80' : 'text-brand-600'}`}>
            {title}
          </p>
          <p className={`text-sm font-bold break-words overflow-hidden ${isPrimary ? 'text-white' : 'text-brand-700'}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

