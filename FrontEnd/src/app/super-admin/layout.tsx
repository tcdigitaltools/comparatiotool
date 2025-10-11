'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideHeader = pathname.startsWith('/super-admin/clients/new') || pathname.includes('/matrix') || pathname.includes('/account'); // no header on create page, matrix page, or account page

  return (
    <div className="min-h-screen bg-slate-50">
      {!hideHeader && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 shadow-sm">
          <div className="w-full flex items-center justify-between">
            {/* Left: logo + titles */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg overflow-hidden flex items-center justify-center">
                <Image 
                  src="/logo.jpg" 
                  alt="TalentCapital Logo" 
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-brand-700">
                  Super Admin Clients List
                </h1>
                <p className="text-sm text-brand-700">
                  Manage client accounts
                </p>
              </div>
            </div>

            {/* Right: Sign Out button */}
            <Link
              href="/"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Sign Out
            </Link>
          </div>
        </header>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 pt-16">{children}</main>
    </div>
  );
}
