'use client';

import { useState, useCallback } from 'react';
import { calculatorService } from '@/lib/api';
import { CalcRequest, CalcResponse, BulkResponse } from '@/lib/api/types';

interface CalculatorState {
  isLoading: boolean;
  error: string | null;
  result: CalcResponse | null;
  bulkResults: BulkResponse | null;
}

export const useCalculator = () => {
  const [state, setState] = useState<CalculatorState>({
    isLoading: false,
    error: null,
    result: null,
    bulkResults: null,
  });

  const calculateIndividual = useCallback(async (calcRequest: CalcRequest) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null, result: null }));
      
      const result = await calculatorService.calculateIndividual(calcRequest);
      
      setState(prev => ({ ...prev, isLoading: false, result }));
      
      return { success: true, result };
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Calculation failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage || 'Calculation failed' }));
      
      return { success: false, error: errorMessage || 'Calculation failed' };
    }
  }, []);

  const calculateBulk = useCallback(async (file: File) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null, bulkResults: null }));
      
      const result = await calculatorService.calculateBulk(file);
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      return result; // Return the Blob directly
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Bulk calculation failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage || 'Bulk calculation failed' }));
      
      throw error; // Re-throw the error
    }
  }, []);

  const downloadResults = useCallback(async (resultId: string) => {
    try {
      const blob = await calculatorService.downloadResults(resultId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compa-ratio-results-${resultId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Download failed';
      setState(prev => ({ ...prev, error: errorMessage || 'Download failed' }));
      
      return { success: false, error: errorMessage || 'Download failed' };
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearResults = useCallback(() => {
    setState(prev => ({ ...prev, result: null, bulkResults: null }));
  }, []);

  return {
    ...state,
    calculateIndividual,
    calculateBulk,
    downloadResults,
    clearError,
    clearResults,
  };
};
