'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface MatrixHeaderProps {
  clientName?: string;
}

export default function MatrixHeader({ 
  clientName = "TechStart Innovations"
}: MatrixHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-0.5 shadow-sm">
      <div className="w-full flex items-center justify-between">
        {/* Left: Title and Subtitle */}
        <div>
          <h1 className="text-2xl font-bold text-brand-700">
            Compa Ratio Matrix
          </h1>
          <p className="text-md text-brand-700 text-base mt-1">{clientName}</p>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-3">
          
          <Link
            href="/super-admin/clients"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-lg hover:from-brand-600 hover:to-brand-700 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Client List
          </Link>
        </div>
      </div>
    </header>
  );
}
