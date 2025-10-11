'use client';

interface UiToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
}

export default function UiToggle({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  description,
}: UiToggleProps) {
  const sizeClasses = {
    sm: 'h-5 w-9',
    md: 'h-6 w-11',
    lg: 'h-7 w-12',
  };

  const handleSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const translateClasses = {
    sm: checked ? 'translate-x-5' : 'translate-x-1',
    md: checked ? 'translate-x-6' : 'translate-x-1',
    lg: checked ? 'translate-x-6' : 'translate-x-1',
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex items-center rounded-full transition shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          sizeClasses[size],
          checked ? 'bg-blue-600' : 'bg-slate-300',
          disabled && 'opacity-50 cursor-not-allowed',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block transform rounded-full bg-white shadow ring-1 ring-black/5 transition',
            handleSize[size],
            translateClasses[size],
          ].join(' ')}
        />
      </button>
      
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-slate-700">{label}</span>
          )}
          {description && (
            <span className="text-xs text-slate-500">{description}</span>
          )}
        </div>
      )}
    </div>
  );
}
