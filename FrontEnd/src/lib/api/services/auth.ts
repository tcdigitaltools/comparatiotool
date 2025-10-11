import { api } from '../client';
import { 
  LoginRequest, 
  RegisterRequest, 
  TokenResponse, 
  User,
  ProfileResponse,
  ProfileUpdateRequest,
  ChangePasswordRequest
} from '../types';

export const authService = {
  // Login
  login: async (credentials: LoginRequest): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/api/auth/login', credentials);
    return response.data;
  },

  // Register
  register: async (userData: RegisterRequest): Promise<User> => {
    const response = await api.post<User>('/api/auth/register', userData);
    return response.data;
  },

  // Logout (client-side only, since JWT is stateless)
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Get current user profile
  getCurrentProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get<ProfileResponse>('/api/profile');
    return response.data;
  },

  // Update current user profile
  updateProfile: async (profileData: ProfileUpdateRequest): Promise<ProfileResponse> => {
    const response = await api.put<ProfileResponse>('/api/profile', profileData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData: ChangePasswordRequest): Promise<void> => {
    await api.put('/api/profile/change-password', passwordData);
  },

  // Upload profile image
  uploadProfileImage: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<{ avatarUrl: string }>('/api/profile/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload profile image for specific user (admin only)
  uploadUserProfileImage: async (userId: string, file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<{ avatarUrl: string }>(`/api/profile/${userId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get profile image URL for a specific user
  getProfileImageUrl: (userId: string): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    return `${baseUrl}/api/profile/${userId}/image`;
  },

  // Get profile image URL for current user
  getCurrentProfileImageUrl: (): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    return `${baseUrl}/api/profile/image`;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // Get stored user data
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Store user data
  storeUser: (user: User, token: string): void => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('authToken', token);
  }
};