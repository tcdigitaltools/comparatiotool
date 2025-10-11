import { api } from '../client';
import { User, UserRole, ClientAccountSummary, ProfileResponse } from '../types';

export const clientsService = {
  // Get individual user profile by ID (Super Admin only)
  getUserProfile: async (userId: string): Promise<ProfileResponse> => {
    try {
      const response = await api.get<ProfileResponse>(`/api/profile/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching profile for user ${userId}:`, error);
      throw error;
    }
  },

  // Get all client admins (Super Admin only) with enriched data
  getAllClientAdmins: async (): Promise<ClientAccountSummary[]> => {
    try {
      // First get the basic client accounts from dashboard API
      const response = await api.get<{clientAccounts: ClientAccountSummary[]}>('/api/admin/dashboard/clients');
      const clientAccounts = response.data.clientAccounts;
      
      // Enrich each client account with individual profile data
      const enrichedClients = await Promise.all(
        clientAccounts.map(async (client) => {
          try {
            // Get individual profile data to get actual industry and other fields
            const profile = await clientsService.getUserProfile(client.id);
            
            // Return enriched client data
            return {
              ...client,
              companyName: profile.companyName || client.companyName,
              contactPerson: profile.fullName || client.contactPerson,
              industry: profile.industry || client.industry,
              ratingScale: profile.performanceRatingScale === 'THREE_POINT' ? '3/5' : '5/5',
              active: profile.active !== undefined ? profile.active : client.active
            };
          } catch (profileError) {
            console.warn(`Failed to get profile for client ${client.id}, using dashboard data:`, profileError);
            // If profile fetch fails, use the dashboard data as fallback
            return client;
          }
        })
      );
      
      return enrichedClients;
    } catch (error) {
      console.error('Error fetching clients:', error);
      // Re-throw error to let the frontend handle it properly
      throw new Error('Failed to fetch clients from server');
    }
  },

  // Get client admin by ID
  getClientAdminById: async (id: string): Promise<ClientAccountSummary> => {
    const response = await api.get<ClientAccountSummary>(`/api/admin/dashboard/clients/${id}`);
    return response.data;
  },

  // Create new client admin
  createClientAdmin: async (clientData: Partial<User>): Promise<User> => {
    const response = await api.post<User>('/api/auth/register', {
      ...clientData,
      role: UserRole.CLIENT_ADMIN
    });
    return response.data;
  },

  // Update client admin
  updateClientAdmin: async (id: string, clientData: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/api/admin/dashboard/clients/${id}`, clientData);
    return response.data;
  },

  // Delete client admin
  deleteClientAdmin: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/dashboard/clients/${id}`);
  },

  // Toggle client status (activate/deactivate)
  toggleClientStatus: async (id: string): Promise<ClientAccountSummary> => {
    const response = await api.put<ClientAccountSummary>(`/api/admin/dashboard/clients/${id}/toggle-status`);
    return response.data;
  },

  // Activate client (legacy method - now uses toggle)
  activateClient: async (id: string): Promise<ClientAccountSummary> => {
    return clientsService.toggleClientStatus(id);
  },

  // Deactivate client (legacy method - now uses toggle)
  deactivateClient: async (id: string): Promise<ClientAccountSummary> => {
    return clientsService.toggleClientStatus(id);
  }
};