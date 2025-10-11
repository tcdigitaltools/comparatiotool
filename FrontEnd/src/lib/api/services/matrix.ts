import { api } from '../client';
import { MatrixResponse, MatrixUpdateRequest } from '../types';

export const matrixService = {
  // Get all matrices for a specific client
  getClientMatrices: async (clientId: string): Promise<MatrixResponse[]> => {
    const response = await api.get<MatrixResponse[]>(`/api/admin/matrix/client/${clientId}`);
    return response.data;
  },

  // Get a specific matrix by ID
  getMatrixById: async (matrixId: string): Promise<MatrixResponse> => {
    const response = await api.get<MatrixResponse>(`/api/admin/matrix/${matrixId}`);
    return response.data;
  },

  // Create a new matrix
  createMatrix: async (clientId: string, matrixData: MatrixUpdateRequest): Promise<MatrixResponse> => {
    const response = await api.post<MatrixResponse>(`/api/admin/matrix/client/${clientId}`, matrixData);
    return response.data;
  },

  // Update an existing matrix by ID
  updateMatrix: async (matrixId: string, clientId: string, matrixData: MatrixUpdateRequest): Promise<MatrixResponse> => {
    const response = await api.put<MatrixResponse>(`/api/admin/matrix/${matrixId}/client/${clientId}`, matrixData);
    return response.data;
  },

  // Delete a matrix
  deleteMatrix: async (matrixId: string): Promise<void> => {
    await api.delete(`/api/admin/matrix/${matrixId}`);
  },

  // Bulk update matrices for a client
  bulkUpdateMatrices: async (clientId: string, matrices: MatrixUpdateRequest[]): Promise<MatrixResponse[]> => {
    console.log('Matrix service - bulkUpdateMatrices called with:', { clientId, matrices });
    try {
      const response = await api.post<MatrixResponse[]>(`/api/admin/matrix/client/${clientId}/bulk`, matrices);
      console.log('Matrix service - API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Matrix service - API error:', error);
      throw error;
    }
  },

  // Reset matrices to default for a client
  resetToDefaultMatrices: async (clientId: string): Promise<MatrixResponse[]> => {
    const response = await api.post<MatrixResponse[]>(`/api/admin/matrix/client/${clientId}/reset`);
    return response.data;
  }
};