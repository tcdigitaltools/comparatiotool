'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/shared';

export default function Home() {
  const { login, isLoading, isAuthenticated } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const canSubmit = email.trim() && password.trim() && !submitting;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Redirect based on JWT role, not selected role
      // The useAuth hook handles this automatically
    }
  }, [isAuthenticated, isLoading]);

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      const result = await login({ email, password });
      
      if (!result.success) {
        setError(result.error || 'Login failed');
      }
      // If successful, the useAuth hook will handle the redirect
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, email, password, login]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      
      {/* Main Content */}
      <main className="relative flex flex-col items-center justify-center min-h-screen px-4">
        

        <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200/50 p-8 relative transform hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/50 via-transparent to-slate-50/30 pointer-events-none"></div>
          <div className="relative z-10">
          <div className="w-full flex justify-center mb-6">
            <Image 
              src="/logo.jpg" 
              alt="TalentCapital Business Advisory" 
              width={200}
              height={64}
              className="h-16 w-auto object-contain"
              priority
              quality={85}
            />
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent text-center mb-8 tracking-tight">
            Compa Ratio Calculator
          </h1>


          {error && (
            <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${
              error.includes('not active') || error.includes('contact the administrator')
                ? 'bg-orange-50 border border-orange-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <AlertCircle className={`h-5 w-5 ${
                error.includes('not active') || error.includes('contact the administrator')
                  ? 'text-orange-600'
                  : 'text-red-600'
              }`} />
              <span className={`${
                error.includes('not active') || error.includes('contact the administrator')
                  ? 'text-orange-800'
                  : 'text-red-800'
              }`}>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-base font-semibold text-brand-600 mb-3">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value), [])}
                className="mt-1 w-full rounded-xl border-2 border-brand-200/60 bg-white px-4 py-3.5 text-brand-700 placeholder:text-gray-400 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100/50 transition-all duration-200 font-medium"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-base font-semibold text-brand-600 mb-3">
                Password
              </label>
              <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={show ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value), [])}
                    className="w-full rounded-xl border-2 border-brand-200/60 bg-white px-4 py-3.5 pr-12 text-brand-700 placeholder:text-gray-400 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100/50 transition-all duration-200 font-medium"
                    placeholder="••••••••"
                  />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-2 my-1 grid place-items-center rounded-xl px-3 hover:bg-brand-50/80 text-brand-600 transition-all duration-200"
                >
                  {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between mt-6">
              <label className="flex items-center gap-3 select-none text-brand-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded-md border-2 border-brand-300 text-brand-600 focus:ring-brand-600 focus:ring-2 accent-brand-600 transition-all duration-200"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="text-sm font-medium">Keep me logged in</span>
              </label>
              <a href="/forgot" className="text-sm font-semibold text-brand-600 hover:text-brand-800 transition-colors duration-200">
                Forgot Password?
              </a>
          </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="group relative inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 px-6 py-4 text-white font-bold shadow-xl shadow-brand-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-102 mt-6"
            >
              
              {submitting ? (
                <span className="relative inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white"></span>
                  <span className="font-semibold">Signing In…</span>
                </span>
              ) : (
                <span className="relative font-semibold tracking-wide">
                  Sign In
                </span>
              )}
            </button>
          </form>
          </div>
        </div>
      </main>
    </div>
  );
}
