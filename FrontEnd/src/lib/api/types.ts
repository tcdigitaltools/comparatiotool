// User and Authentication Types
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  name?: string; // Company name for client admins
  companyName?: string; // Company name from ProfileResponse
  role: UserRole;
  industry?: string;
  active?: boolean;
  avatarUrl?: string;
  logoUrl?: string;
  performanceRatingScale?: string;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Client Account Summary (from dashboard API)
export interface ClientAccountSummary {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  industry: string;
  ratingScale: string;
  active: boolean;
  createdAt?: string;
  lastLoginAt?: string;
  totalEmployees: number;
  totalCalculations: number;
  status: string;
}

// Profile Response (from profile API)
export interface ProfileResponse {
  id: string;
  username: string;
  email: string;
  fullName: string;
  companyName: string;
  industry?: string;
  avatarUrl?: string;
  role: string;
  active?: boolean;
  performanceRatingScale?: string;
  currency?: string;
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CLIENT_ADMIN = 'CLIENT_ADMIN'
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  fullName: string;
  password: string;
  role: UserRole;
  name?: string;
  industry?: string;
  active?: boolean;
  avatarUrl?: string;
  performanceRatingScale?: string;
  currency?: string;
}

export interface TokenResponse {
  token: string;
  type: string;
  expiresIn: number;
}

export interface ProfileResponse {
  id: string;
  username: string;
  email: string;
  fullName: string;
  companyName: string;
  industry?: string;
  avatarUrl?: string;
  logoUrl?: string;
  role: string;
  active?: boolean;
  performanceRatingScale?: string;
  currency?: string;
}

export interface ProfileUpdateRequest {
  fullName?: string;
  companyName?: string;
  industry?: string;
  avatarUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Calculation Types
export interface CalcRequest {
  currentSalary: number;
  midOfScale: number;
  yearsExperience: number;
  performanceRating: number;
  employeeCode?: string;
  jobTitle?: string;
  asOf?: string; // ISO date string
}

export interface CalcResponse {
  compaRatio: number;
  compaLabel: string;
  increasePct: number;
  newSalary: number;
}


// Matrix Types
export interface AdjustmentMatrix {
  id: string;
  clientId: string;
  yearsExperience: number;
  performanceRating: number;
  adjustmentPercentage: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MatrixUpdateRequest {
  yearsExperience?: number;
  performanceRating?: number;
  adjustmentPercentage?: number;
  active?: boolean;
}

export interface MatrixResponse {
  id: string;
  clientId: string;
  yearsExperience: number;
  performanceRating: number;
  adjustmentPercentage: number;
  active: boolean;
}

export interface MatrixValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface MatrixBulkResponse {
  success: boolean;
  processedCount: number;
  errors: string[];
  matrices: MatrixResponse[];
}

// Bulk Processing Types
export interface BulkRowResult {
  rowNumber: number;
  success: boolean;
  error?: string;
  result?: CalcResponse;
}

export interface BulkResponse {
  success: boolean;
  processedCount: number;
  successCount: number;
  errorCount: number;
  results: BulkRowResult[];
  downloadUrl?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Matrix Types
export interface MatrixResponse {
  id: string;
  clientId: string;
  clientName: string;
  perfBucket: number;
  compaFrom: number;
  compaTo: number;
  pctLt5Years: number;
  pctGte5Years: number;
  active: boolean;
  compaRangeLabel: string;
}

export interface MatrixUpdateRequest {
  perfBucket: number;
  compaFrom: number;
  compaTo: number;
  pctLt5Years: number;
  pctGte5Years: number;
  active?: boolean;
}

// Dashboard Types
export interface DashboardStatistics {
  totalEmployees: number;
  totalCurrentSalary: number;
  totalNewSalary: number;
  totalPercentageChange: number;
  compaRatioAnalysis: {
    minimum: number;
    maximum: number;
    average: number;
  };
  percentageIncreaseAnalysis: {
    minimum: number;
    maximum: number;
    average: number;
  };
  amountIncreaseAnalysis: {
    minimum: number;
    maximum: number;
    average: number;
  };
  clientId: string;
  lastUpdated: string;
}

// Analysis API Types
export interface AnalysisEmployee {
  rowIndex: number;
  employeeCode: string;
  employeeName: string;
  jobTitle: string;
  yearsExperience: number;
  performanceRating5: number;
  currentSalary: number;
  midOfScale: number;
  compaRatio: number;
  compaLabel: string;
  increasePct: number;
  newSalary: number;
  increaseAmount: number;
  error: string | null;
}

export interface AnalysisResponse {
  content: AnalysisEmployee[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface AnalysisFilter {
  type: 'salary' | 'percentage';
  from?: number;
  to?: number;
}

export interface AnalysisRequest {
  type: 'salary' | 'percentage';
  from?: number;
  to?: number;
  page?: number;
  size?: number;
}

// Error Types
export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
  path: string;
  details?: unknown;
}