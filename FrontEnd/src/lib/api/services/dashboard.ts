import { api } from '../client';
import { DashboardStatistics } from '../types';

export const dashboardService = {
  // Get client dashboard statistics
  // CLIENT_ADMIN: automatically gets their own stats
  // SUPER_ADMIN: can specify clientId to view any client's stats
  getClientStatistics: async (clientId?: string): Promise<DashboardStatistics> => {
    const url = clientId 
      ? `/api/admin/dashboard/client-statistics?clientId=${clientId}`
      : '/api/admin/dashboard/client-statistics';
    
    const response = await api.get<DashboardStatistics>(url);
    return response.data;
  },
};

