'use client';

import Link from 'next/link';
import { Settings, Eye } from 'lucide-react';

interface ClientCardProps {
  id: string;
  name: string;
  contactName: string;
  email: string;
  industry: string;
  ratingScale: string;
  active: boolean;
  onToggle?: (id: string) => void;
  onView?: (id: string) => void;
}

export default function ClientCard({
  id,
  name,
  contactName,
  email,
  industry,
  ratingScale,
  active,
  onToggle,
}: ClientCardProps) {
  return (
    <article className="rounded-xl border border-brand-200 bg-brand-50 shadow-sm px-4 sm:px-5 py-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left: icon + details */}
        <div className="flex items-start gap-3 min-w-0">
          {/* Company avatar */}
          <div className="mt-1 h-9 w-9 rounded-full bg-brand-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {name && name.length > 0 ? name.charAt(0).toUpperCase() : '?'}
          </div>
          
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-brand-700 font-semibold truncate">
                {name || 'Unnamed Company'}
              </h3>

              {/* Status pill */}
              <span
                className={[
                  'inline-flex items-center rounded-full px-2 py-[2px] text-[12px] font-medium border',
                  active
                    ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white border-transparent'
                    : 'bg-slate-100 text-slate-800 border-slate-300',
                ].join(' ')}
                aria-live="polite"
              >
                {active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <p className="mt-1 text-sm text-brand-700">
              {contactName || 'No Contact'} •{' '}
              <span className="underline decoration-slate-300 underline-offset-[3px]">
                {email || 'No Email'}
              </span>
            </p>
            <p className="text-sm text-brand-700">
              {industry || 'No Industry'} • Rating Scale: {ratingScale || 'N/A'}
            </p>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <Toggle checked={active} onChange={() => onToggle?.(id)} />
            <span className="text-sm text-brand-700 hidden sm:inline">
              {active ? 'On' : 'Off'}
            </span>
          </div>

          {/* Action buttons - Only Manage Matrix and View Account */}
          <div className="flex items-center gap-2">
            <Link
              href={`/super-admin/clients/${id}/matrix`}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand-700 hover:text-white hover:bg-gradient-to-r hover:from-brand-700 hover:to-brand-800 rounded-lg transition-all duration-300"
            >
              <Settings className="h-4 w-4" />
              Manage Matrix
            </Link>
            
            <Link
              href={`/super-admin/clients/${id}/account`}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand-700 hover:text-white hover:bg-gradient-to-r hover:from-brand-700 hover:to-brand-800 rounded-lg transition-all duration-300"
            >
              <Eye className="h-4 w-4" />
              View Account
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/* Toggle component */
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={[
        'relative inline-flex h-6 w-11 items-center rounded-full transition shadow-inner',
        checked ? 'bg-gradient-to-r from-brand-600 to-brand-700' : 'bg-slate-300',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block h-4 w-4 transform rounded-full bg-white shadow ring-1 ring-black/5 transition',
          checked ? 'translate-x-6' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  );
}
