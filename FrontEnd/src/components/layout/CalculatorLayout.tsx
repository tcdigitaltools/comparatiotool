'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { 
  Calculator, 
  LogOut, 
  Menu, 
  User,
  ChevronDown,
  Upload,
  BarChart3,
  Building2
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalculatorNavigation } from './CalculatorNavigation';
import { useCalculatorContext } from '@/contexts/CalculatorContext';
import AuthenticatedImage from '@/shared/components/AuthenticatedImage';

interface CalculatorLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const CalculatorLayout: React.FC<CalculatorLayoutProps> = ({
  children,
  title: propTitle,
}) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [calculatorsOpen] = useState(true);
  const [analyticsOpen] = useState(true);


  const getLogoUrl = (filePath: string): string | null => {
    if (!filePath) return null;
    
    if (filePath.startsWith('data:')) {
      return filePath;
    }
    
    const match = filePath.match(/profiles[\\\/]([^\\\/]+)[\\\/]/);
    if (match && match[1]) {
      const userId = match[1];
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const token = localStorage.getItem('authToken');
      if (token) {
        return `${baseUrl}/api/profile/${userId}/image`;
      }
    }
    
    return null;
  };

  const isCalculatorPage = pathname === '/calculator';
  
  try {
    useCalculatorContext();
  } catch {
  }
  
  const [title, setTitle] = useState<string>(propTitle || 'COMPA RATIO CALCULATOR');
  
  useEffect(() => {
    if (propTitle) {
      setTitle(propTitle);
    } else {
      setTitle('COMPA RATIO CALCULATOR');
    }
  }, [propTitle]);

  const navigation = [
    {
      name: 'Individual',
      href: '/calculator',
      icon: Calculator,
      roles: ['CLIENT_ADMIN'],
      category: 'calculators',
      tab: 'individual'
    },
    {
      name: 'Dashboard',
      href: '/calculator',
      icon: BarChart3,
      roles: ['CLIENT_ADMIN'],
      category: 'analytics',
      tab: 'dashboard'
    },
    {
      name: 'Bulk Upload',
      href: '/calculator',
      icon: Upload,
      roles: ['CLIENT_ADMIN'],
      category: 'calculators',
      tab: 'bulk'
    },
  ];

  const filteredNavigation = navigation.filter(item => {
    const userRole = user?.role || '';
    const hasAccess = item.roles.includes(userRole);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Navigation Debug - User role:', userRole);
      console.log('Navigation Debug - Item:', item.name, 'Roles:', item.roles, 'Has access:', hasAccess);
    }
    
    return hasAccess;
  });

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center ml-16">
                {user?.avatarUrl ? (
                  <div className="h-14 w-22 rounded-lg overflow-hidden flex items-center justify-center bg-white">
                    <AuthenticatedImage
                      key={user.avatarUrl}
                      src={getLogoUrl(user.avatarUrl) || user.avatarUrl}
                      alt="Company Logo"
                      className="h-full w-full object-cover"
                      onError={() => {}}
                      fallback={
                        <div className="h-12 w-16 rounded-lg bg-brand-500 flex items-center justify-center">
                          <Building2 className="h-7 w-7 text-white" />
                        </div>
                      }
                    />
                  </div>
                ) : (
                  <div className="h-12 w-16 rounded-lg bg-brand-500 flex items-center justify-center">
                    <Building2 className="h-7 w-7 text-white" />
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
            
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-2xl md:text-3xl font-bold text-green-700">
                {title}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded-lg transition-all duration-200"
                >
                  <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-semibold text-brand-700 truncate max-w-24">
                      {user?.companyName}
                    </p>
                    <p className="text-xs text-brand-600 truncate max-w-24">{user?.email}</p>
          </div>
                  <ChevronDown className={`h-3 w-3 text-brand-600 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-brand-200 py-3 z-50">
                    {/* Profile Button */}
                    <Link
                      href={`/super-admin/clients/${user?.id}/account`}
                      onClick={() => {
                        setIsProfileOpen(false);
                      }}
                      className="flex items-center gap-3 px-6 py-3 text-brand-700 hover:bg-brand-50 transition-all duration-200 w-full"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>

                    {/* Separator */}
                    <div className="border-t border-brand-200 my-2"></div>

          <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileOpen(false);
                      }}
                      className="flex items-center gap-3 px-6 py-3 text-brand-700 hover:bg-brand-50 transition-all duration-200 w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
          </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      <div className="flex p-3 ">
        <div className={`w-64 bg-gradient-to-r from-brand-700 to-brand-600 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 rounded-3xl pt-8 pb-6 px-6 mt-6 mb-7`}>

        <nav className="px-3">
          <div className="space-y-3">
            {/* Calculators Section */}
            {filteredNavigation.some(item => item.category === 'calculators') && (
              <>
                <div className="flex items-center justify-start w-full py-2 text-sm font-semibold text-white uppercase tracking-wider px-2">
                  Calculators
                </div>
                {isCalculatorPage ? (
                  <CalculatorNavigation />
                ) : (
                  calculatorsOpen && (
                    <div className="ml-4 space-y-1">
                      {filteredNavigation.filter(item => item.category === 'calculators').map((item) => {
                        const isActive = pathname === item.href;
                        
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              isActive
                                ? 'bg-brand-500 text-white hover:bg-brand-600'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  )
                )}
              </>
            )}
            
            {filteredNavigation.some(item => item.category === 'analytics') && (
              <>
                <div className="flex px-2 items-center justify-start w-full py-2 text-sm font-semibold text-white uppercase tracking-wider">
                  Analytics
                </div>
                {isCalculatorPage ? (
                  <CalculatorNavigation section="analytics" />
                ) : (
                  analyticsOpen && (
                    <div className="ml-4 space-y-1">
                      {filteredNavigation.filter(item => item.category === 'analytics').map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              isActive
                                ? 'bg-brand-500 text-white hover:bg-brand-600'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  )
                )}
              </>
            )}
            
            {filteredNavigation.filter(item => !item.category).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-brand-500 text-white hover:bg-brand-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 w-full px-3 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>

        <div className="flex-1">
        <main className="p-6 pb-8">
          {children}
        </main>
        </div>
      </div>
    </div>
  );
};
