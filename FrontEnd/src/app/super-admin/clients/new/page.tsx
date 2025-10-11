'use client';
import { useState } from 'react';
import Link from "next/link";
import { Building2, UserPlus, ArrowLeft, ChevronDown } from 'lucide-react';
import { authService } from '@/lib/api/services/auth';
import { UserRole } from '@/lib/api/types';

export default function CreateClientUserPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [scale, setScale] = useState('');
  const [contactName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const canSubmit = email && password && companyName && industry && scale && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    
    try {
      const registerData = {
        email,
        password,
        username: email.split('@')[0],
        fullName: contactName || email.split('@')[0],
        name: companyName,
        industry,
        role: UserRole.CLIENT_ADMIN,
        active: true,
        performanceRatingScale: scale === '3' ? 'THREE_POINT' : 'FIVE_POINT',
        currency: 'USD'
      };
      
      await authService.register(registerData);
      
      window.location.href = '/super-admin/clients';
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-gradient-to-br from-brand-50 to-blue-50">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/super-admin/clients"
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div className="h-12 w-12 rounded-xl bg-brand-100 flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-brand-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-brand-700 mb-2">
          Create New Client User
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-brand-700 placeholder:text-gray-400 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              placeholder="john@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-brand-700 placeholder:text-gray-400 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              placeholder="Minimum 8 characters"
            />
          </div>

          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-brand-700 mb-2">
              Company Name
            </label>
            <input
              id="companyName"
              type="text"
              required
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-brand-700 placeholder:text-gray-400 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              placeholder="Acme Corporation"
            />
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-brand-700 mb-2">
              Industry
            </label>
            <input
              id="industry"
              type="text"
              required
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-brand-700 placeholder:text-gray-400 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              placeholder="Technology, Finance, Healthcare..."
            />
          </div>

          <div>
            <label htmlFor="scale" className="block text-sm font-medium text-brand-700 mb-2">
              Performance Rating Scale
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 border border-brand-200 bg-white rounded-xl text-brand-700 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              >
                <span className="text-brand-700">
                  {scale === '3' ? '3-Point Rating Scale' : 
                   scale === '5' ? '5-Point Rating Scale' : 
                   'Select a rating scale...'}
                </span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setScale('3');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-200 ${
                        scale === '3' 
                          ? 'bg-brand-500 text-white hover:bg-brand-600' 
                          : 'text-slate-800 hover:bg-brand-50 hover:text-brand-500'
                      }`}
                    >
                      <span>3-Point Rating Scale</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setScale('5');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-200 ${
                        scale === '5' 
                          ? 'bg-brand-500 text-white hover:bg-brand-600' 
                          : 'text-slate-800 hover:bg-brand-50 hover:text-brand-500'
                      }`}
                    >
                      <span>5-Point Rating Scale</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="group relative inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-3 text-white font-semibold shadow-lg shadow-brand-200/40 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white"></span>
                Creating Client...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Create Client Account
              </span>
            )}
          </button>

          <div className="text-center">
            <Link
              href="/super-admin/clients"
              className="text-sm font-medium text-brand-700 hover:text-brand-800 underline decoration-brand-300 underline-offset-[3px]"
            >
              Cancel and return to clients
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
