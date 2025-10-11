'use client';

import React from 'react';
import { AnalysisResponse } from '@/lib/api/types';

interface AnalysisResultsTableProps {
  results: AnalysisResponse | null;
  isLoading: boolean;
  currentFilter: {
    type: 'salary' | 'percentage';
    from?: number;
    to?: number;
  } | null;
  onClearResults: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const AnalysisResultsTable: React.FC<AnalysisResultsTableProps> = ({
  results,
  isLoading,
  currentFilter,
  onClearResults,
  onPageChange,
  onPageSizeChange
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-brand-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
          <span className="ml-4 text-brand-700 font-medium">Loading results...</span>
        </div>
      </div>
    );
  }

  if (!results || !currentFilter) {
    return null;
  }

  const { content: employees, totalElements, totalPages, number: currentPage, size: pageSize } = results;

  const getFilterDescription = () => {
    const valueType = currentFilter.type === 'salary' ? '$' : '%';
    const typeText = currentFilter.type === 'salary' ? 'Salary increase' : 'Percentage increase';
    
    if (currentFilter.from !== undefined && currentFilter.to !== undefined) {
      return `${typeText} from ${currentFilter.from}${valueType} to ${currentFilter.to}${valueType}`;
    } else if (currentFilter.from !== undefined) {
      return `${typeText} greater than or equal to ${currentFilter.from}${valueType}`;
    } else if (currentFilter.to !== undefined) {
      return `${typeText} less than or equal to ${currentFilter.to}${valueType}`;
    } else {
      return `All ${currentFilter.type === 'salary' ? 'salary increases' : 'percentage increases'}`;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-brand-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-brand-700 uppercase">
            Analysis Results
          </h2>
          <p className="text-base text-brand-600 mt-2">
            {getFilterDescription()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-brand-700">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-3 py-1 border border-brand-300 rounded-md text-sm text-brand-700 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-brand-600">results per page</span>
          </div>
          <button
            onClick={onClearResults}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium text-sm"
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-brand-50 rounded-xl p-4 mb-4">
        <p className="text-brand-600 font-medium text-center">
          {totalElements} employees 
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brand-200 bg-gradient-to-r from-brand-600 to-brand-700">
              <th className="ml-1 py-3 px-2 text-sm font-semibold text-white border-r border-white/30 rounded-tl-lg">Employee</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-white border-r border-white/30">Job Title</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-white border-r border-white/30">Years Exp.</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-white border-r border-white/30">Performance</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-white border-r border-white/30">Current Salary</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-white border-r border-white/30">% Increase</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-white border-r border-white/30">New Salary</th>
              <th className="text-center py-3 px-2 text-sm font-semibold text-white rounded-tr-lg">Increase</th>
            </tr>
          </thead>
          <tbody>
            {employees
              .sort((a, b) => a.employeeCode.localeCompare(b.employeeCode)) // Sort by employee code like bulk upload
              .map((employee, index) => {
              const currentSalary = employee.currentSalary || 0;
              const newSalary = employee.newSalary || 0;
              const increaseAmount = employee.increaseAmount || 0;
              
              return (
                <tr key={employee.employeeCode} className={`border-b border-brand-100 ${index % 2 === 0 ? 'bg-brand-50/30' : 'bg-white'} hover:bg-brand-50`}>
                  <td className="py-3 px-4 border-r border-brand-200 text-left">
                    <div>
                      <div className="font-semibold text-brand-700 text-sm">{employee.employeeName || 'N/A'}</div>
                      <div className="text-xs text-brand-600">{employee.employeeCode || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-brand-700 border-r border-brand-200 text-sm text-center">{employee.jobTitle || 'N/A'}</td>
                  <td className="py-3 px-4 text-brand-700 border-r border-brand-200 text-center text-sm">{employee.yearsExperience || 'N/A'}</td>
                  <td className="py-3 px-4 text-brand-700 border-r border-brand-200 text-center text-sm">{employee.performanceRating5 || 'N/A'}</td>
                  <td className="py-3 px-4 text-brand-700 border-r border-brand-200 text-sm text-center">{currentSalary.toLocaleString()}$</td>
                  <td className="py-3 px-4 text-brand-600 font-semibold border-r border-brand-200 text-center text-sm">{employee.increasePct || 0}%</td>
                  <td className="py-3 px-4 text-brand-700 border-r border-brand-200 text-sm text-center font-bold">{newSalary.toLocaleString()}$</td>
                  <td className="py-3 px-4 text-brand-600 text-sm text-center font-semibold">+{increaseAmount.toLocaleString()}$</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-brand-200">
          <div className="text-sm text-brand-600">
            Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} results
          </div>
          
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3 py-2 text-sm border border-brand-300 rounded-md hover:bg-brand-50 disabled:opacity-50 disabled:cursor-not-allowed text-brand-700"
            >
              Previous
            </button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (currentPage <= 2) {
                pageNum = i;
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-2 text-sm border rounded-md ${
                    currentPage === pageNum
                      ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white border-brand-600'
                      : 'border-brand-300 hover:bg-brand-50 text-brand-700'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-2 text-sm border border-brand-300 rounded-md hover:bg-brand-50 disabled:opacity-50 disabled:cursor-not-allowed text-brand-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
