import { api } from '../client';
import { CalcRequest, CalcResponse, AnalysisResponse } from '../types';
import axios from 'axios';

export const calculatorService = {
  // Individual calculation
  calculateIndividual: async (calcRequest: CalcRequest): Promise<CalcResponse> => {
    const response = await api.post<CalcResponse>('/api/calc/individual', calcRequest);
    return response.data;
  },

  // Bulk calculation → manual URL with /api and static token
// Bulk calculation → URL with /api and token from sessionStorage
calculateBulk: async (file: File): Promise<Blob> => {
  const formData = new FormData();
  formData.append('file', file);

  // ✅ Get token from sessionStorage
  const token = localStorage.getItem('authToken');

  const response = await axios.post<Blob>(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/calc/bulk`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,  //Dynamic token here
      },
      responseType: 'blob',
      timeout: 120000, // 2 minutes timeout for bulk operations
    }
  );

  return response.data;
},


  // Download calculation results
  downloadResults: async (resultId: string): Promise<Blob> => {
    const response = await api.get<Blob>(`/api/calc/download/${resultId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Get calculation history
  getCalculationHistory: async (page: number = 0, size: number = 10) => {
    const response = await api.get(`/api/calc/history?page=${page}&size=${size}`);
    return response.data;
  },

  // Get calculation by ID
  getCalculationById: async (id: string): Promise<CalcResponse> => {
    const response = await api.get<CalcResponse>(`/api/calc/${id}`);
    return response.data;
  },

  // Get bulk calculation results with pagination
  getBulkResults: async (page: number = 0, size: number = 10, sortBy: string = 'employeeCode', sortDirection: string = 'ASC') => {
    const response = await api.get(`/api/calc/results?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`);
    
    // Sort results by employeeCode on the frontend to ensure correct order
    const data = response.data as { rows: { employeeCode: string }[] };
    if (data && data.rows) {
      data.rows.sort((a, b) => {
        return a.employeeCode.localeCompare(b.employeeCode);
      });
    }
    
    return data;
  },

  // Analysis APIs for filtering calculation results
  analyzeBySalaryIncrease: async (
    equalTo?: number, 
    lessThan?: number, 
    greaterThan?: number, 
    page: number = 0, 
    size: number = 20
  ): Promise<AnalysisResponse> => {
    const params = new URLSearchParams();
    if (equalTo !== undefined) params.append('equalTo', equalTo.toString());
    if (lessThan !== undefined) params.append('lessThan', lessThan.toString());
    if (greaterThan !== undefined) params.append('greaterThan', greaterThan.toString());
    params.append('page', page.toString());
    params.append('size', size.toString());

    const response = await api.get<AnalysisResponse>(`/api/calc/analysis/salary-increase?${params.toString()}`);
    return response.data;
  },

  analyzeByPercentageIncrease: async (
    equalTo?: number, 
    lessThan?: number, 
    greaterThan?: number, 
    page: number = 0, 
    size: number = 20
  ): Promise<AnalysisResponse> => {
    const params = new URLSearchParams();
    if (equalTo !== undefined) params.append('equalTo', equalTo.toString());
    if (lessThan !== undefined) params.append('lessThan', lessThan.toString());
    if (greaterThan !== undefined) params.append('greaterThan', greaterThan.toString());
    params.append('page', page.toString());
    params.append('size', size.toString());

    const response = await api.get<AnalysisResponse>(`/api/calc/analysis/percentage-increase?${params.toString()}`);
    return response.data;
  },
};
