'use client';

import React from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  requireAuth = true,
  allowedRoles = [],
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      router.push('/');
      return;
    }

    if (requireAuth && isAuthenticated && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user?.role || '')) {
        router.push('/unauthorized');
        return;
      }
    }

    if (!requireAuth && isAuthenticated) {
      // If user is already authenticated and trying to access login page, redirect to appropriate page
      const redirectPath = user?.role === 'SUPER_ADMIN' ? '/super-admin/clients' : '/calculator';
      router.push(redirectPath);
    }
  }, [isAuthenticated, isLoading, user, requireAuth, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requireAuth && isAuthenticated && allowedRoles.length > 0 && !allowedRoles.includes(user?.role || '')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
