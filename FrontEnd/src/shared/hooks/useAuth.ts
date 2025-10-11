'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/api';
import { User, UserRole, LoginRequest, RegisterRequest, ProfileUpdateRequest } from '@/lib/api/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (typeof window === 'undefined') {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
          return;
        }
        
        const storedUser = authService.getStoredUser();
        const isAuthenticated = authService.isAuthenticated();
        
        if (isAuthenticated && storedUser) {
          try {
            const currentProfile = await authService.getCurrentProfile();
            
            
            const finalRole = storedUser.role || (currentProfile.role as UserRole);
            
            setAuthState({
              user: { 
                ...storedUser, 
                ...currentProfile,
                fullName: currentProfile.fullName || storedUser.fullName || 'User', // Use backend fullName first
                role: finalRole
              },
              isLoading: false,
              isAuthenticated: true,
            });
          } catch {
            
            authService.logout();
            setAuthState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const tokenResponse = await authService.login(credentials);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', tokenResponse.token);
      }
      
      const tokenPayload = JSON.parse(atob(tokenResponse.token.split('.')[1]));
      const userRole = tokenPayload.roles?.[0]?.replace('ROLE_', '') || 'CLIENT_ADMIN';
      
      const user: User = {
        id: tokenPayload.id || 'temp-id',
        username: credentials.email.split('@')[0],
        email: credentials.email,
        fullName: 'User',
        name: 'Company',
        role: userRole as UserRole,
        industry: 'Technology',
        active: true,
        avatarUrl: undefined,
      };
      
      authService.storeUser(user, tokenResponse.token);
      
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });

      if (user.role === 'SUPER_ADMIN') {
        router.push('/super-admin/clients');
      } else {
        router.push('/calculator');
      }
      
      return { success: true };
    } catch (error: unknown) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { error?: string } } };
        const status = axiosError.response?.status;
        const errorMessage = axiosError.response?.data?.error;
        
        if (status === 403) {
          return { 
            success: false, 
            error: errorMessage || 'Your account is not active. Please contact the administrator to activate your account.' 
          };
        }
        
        if (status === 401) {
          return { 
            success: false, 
            error: 'Invalid email or password' 
          };
        }
        
        return { 
          success: false, 
          error: errorMessage || 'Login failed' 
        };
      }
      
      return { 
        success: false, 
        error: 'Login failed' 
      };
    }
  }, [router]);

  const register = useCallback(async (userData: RegisterRequest) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const newUser = await authService.register(userData);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      return { success: true, user: newUser };
    } catch (error: unknown) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Registration failed';
      return { 
        success: false, 
        error: errorMessage || 'Registration failed' 
      };
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
    router.push('/');
  }, [router]);

  const updateProfile = useCallback(async (profileData: ProfileUpdateRequest) => {
    try {
      const updatedProfile = await authService.updateProfile(profileData);
      
      const updatedUser: User = {
        ...authState.user!,
        fullName: updatedProfile.fullName,
        name: updatedProfile.companyName,
        industry: updatedProfile.industry,
        avatarUrl: updatedProfile.avatarUrl,
      };
      
      authService.storeUser(updatedUser, localStorage.getItem('authToken')!);
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
      
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Profile update failed';
      return { 
        success: false, 
        error: errorMessage || 'Profile update failed' 
      };
    }
  }, [authState.user]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      await authService.changePassword({ currentPassword, newPassword });
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Password change failed';
      return { 
        success: false, 
        error: errorMessage || 'Password change failed' 
      };
    }
  }, []);

  const uploadProfileImage = useCallback(async (file: File) => {
    try {
      const result = await authService.uploadProfileImage(file);
      
      const updatedUser = {
        ...authState.user!,
        avatarUrl: result.avatarUrl,
      };
      
      authService.storeUser(updatedUser, localStorage.getItem('authToken')!);
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
      
      return { success: true, avatarUrl: result.avatarUrl };
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Image upload failed';
      return { 
        success: false, 
        error: errorMessage || 'Image upload failed' 
      };
    }
  }, [authState.user]);

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    uploadProfileImage,
  };
};
