import { api } from '../client';
import { AnalysisResponse } from '../types';

export const analysisService = {
  // Analyze by salary increase amount (dollar range)
  analyzeBySalaryIncrease: async (params: {
    from?: number;
    to?: number;
    page?: number;
    size?: number;
  }): Promise<AnalysisResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.from !== undefined) {
      searchParams.append('from', params.from.toString());
    }
    if (params.to !== undefined) {
      searchParams.append('to', params.to.toString());
    }
    if (params.page !== undefined) {
      searchParams.append('page', params.page.toString());
    }
    if (params.size !== undefined) {
      searchParams.append('size', params.size.toString());
    }

    const url = `/api/calc/analysis/salary-increase${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await api.get<AnalysisResponse>(url);
    return response.data;
  },

  // Analyze by percentage increase (percentage range)
  analyzeByPercentageIncrease: async (params: {
    from?: number;
    to?: number;
    page?: number;
    size?: number;
  }): Promise<AnalysisResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.from !== undefined) {
      searchParams.append('from', params.from.toString());
    }
    if (params.to !== undefined) {
      searchParams.append('to', params.to.toString());
    }
    if (params.page !== undefined) {
      searchParams.append('page', params.page.toString());
    }
    if (params.size !== undefined) {
      searchParams.append('size', params.size.toString());
    }

    const url = `/api/calc/analysis/percentage-increase${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await api.get<AnalysisResponse>(url);
    return response.data;
  },
};
