// Export all API services
export { authService } from './services/auth';
export { calculatorService } from './services/calculator';
export { clientsService } from './services/clients';
export { matrixService } from './services/matrix';
export { dashboardService } from './services/dashboard';
export { analysisService } from './services/analysis';

// Export API client and types
export { default as apiClient, api } from './client';
export * from './types';

// Create a centralized API object for easy access
import { authService } from './services/auth';
import { calculatorService } from './services/calculator';
import { clientsService } from './services/clients';
import { matrixService } from './services/matrix';
import { dashboardService } from './services/dashboard';
import { analysisService } from './services/analysis';

export const API = {
  auth: authService,
  calculator: calculatorService,
  clients: clientsService,
  matrix: matrixService,
  dashboard: dashboardService,
  analysis: analysisService,
};