'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { dashboardService, DashboardStatistics, AnalysisResponse, AnalysisFilter } from '@/lib/api';
import { analysisService } from '@/lib/api/services/analysis';
import { StatCard } from './StatCard';
import { AnalysisFilter as AnalysisFilterComponent } from './AnalysisFilter';
import { AnalysisResultsTable } from './AnalysisResultsTable';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  BarChart3,
  Coins,
  BarChart
} from 'lucide-react';

export const DashboardContent: React.FC = () => {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Analysis filter state
  const [analysisResults, setAnalysisResults] = useState<AnalysisResponse | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<AnalysisFilter | null>(null);
  const [showResultsTable, setShowResultsTable] = useState(false);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // CLIENT_ADMIN gets their own stats, SUPER_ADMIN would need to pass clientId
        const data = await dashboardService.getClientStatistics(
          user?.role === 'SUPER_ADMIN' ? user?.id : undefined
        );
        
        setStatistics(data);
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
        setError('Failed to load dashboard statistics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStatistics();
    }
  }, [user]);

  // Format number with commas
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Format currency
  const formatCurrency = (num: number): string => {
    return `${formatNumber(num)}$`;
  };

  // Format percentage
  const formatPercentage = (num: number): string => {
    return `${num.toFixed(2)}%`;
  };

  // Analysis filter functions
  const handleAnalysisFilter = async (
    type: 'salary' | 'percentage',
    from?: number,
    to?: number
  ) => {
    try {
      setIsAnalysisLoading(true);
      setShowResultsTable(false); // Hide previous table immediately

      let response: AnalysisResponse;
      
      if (type === 'salary') {
        response = await analysisService.analyzeBySalaryIncrease({
          from,
          to,
          page: 0,
          size: pageSize
        });
      } else {
        response = await analysisService.analyzeByPercentageIncrease({
          from,
          to,
          page: 0,
          size: pageSize
        });
      }

      setAnalysisResults(response);
      setCurrentFilter({ type, from, to });
      setShowResultsTable(true);
    } catch (err) {
      console.error('Error filtering analysis results:', err);
      setError(err instanceof Error ? err.message : 'Failed to filter results');
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const handleClearResults = () => {
    setAnalysisResults(null);
    setCurrentFilter(null);
    setShowResultsTable(false);
  };

  const handlePageChange = async (page: number) => {
    if (!currentFilter) return;

    try {
      setIsAnalysisLoading(true);

      let response: AnalysisResponse;
      
      if (currentFilter.type === 'salary') {
        response = await analysisService.analyzeBySalaryIncrease({
          from: currentFilter.from,
          to: currentFilter.to,
          page,
          size: pageSize
        });
      } else {
        response = await analysisService.analyzeByPercentageIncrease({
          from: currentFilter.from,
          to: currentFilter.to,
          page,
          size: pageSize
        });
      }

      setAnalysisResults(response);
    } catch (err) {
      console.error('Error changing page:', err);
      setError('Failed to load page');
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const handlePageSizeChange = async (size: number) => {
    if (!currentFilter) return;

    try {
      setIsAnalysisLoading(true);
      setPageSize(size);

      let response: AnalysisResponse;
      
      if (currentFilter.type === 'salary') {
        response = await analysisService.analyzeBySalaryIncrease({
          from: currentFilter.from,
          to: currentFilter.to,
          page: 0,
          size
        });
      } else {
        response = await analysisService.analyzeByPercentageIncrease({
          from: currentFilter.from,
          to: currentFilter.to,
          page: 0,
          size
        });
      }

      setAnalysisResults(response);
    } catch (err) {
      console.error('Error changing page size:', err);
      setError('Failed to load results');
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !statistics) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="text-brand-700 text-lg mb-4">⚠️ {error || 'No data available'}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg hover:shadow-lg transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="bg-white/90 backdrop-blur-md hover:shadow-xl border border-brand-200 shadow-lg rounded-3xl p-8">
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <BarChart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Dashboard</h3>
            </div>
          </div>
        </div>

        {/* Dashboard Content Container */}
        <div className="max-w-7xl mx-auto space-y-6">
          {/* OVERALL SUMMARY Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-brand-200 p-6">
            <h2 className="text-xl font-semibold text-brand-700 mb-6 uppercase">OVERALL SUMMARY</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard
                title="Total Employees"
                value={formatNumber(statistics.totalEmployees)}
                icon={<Users className="w-4 h-4" />}
                titleSize="medium"
              />
              <StatCard
                title="Total Current Salaries"
                value={formatCurrency(statistics.totalCurrentSalary)}
                icon={<DollarSign className="w-4 h-4" />}
                titleSize="medium"
              />
              <StatCard
                title="Total New Salaries"
                value={formatCurrency(statistics.totalNewSalary)}
                icon={<Coins className="w-4 h-4" />}
                titleSize="medium"
              />
              <StatCard
                title="Total Amount Increase"
                value={formatCurrency(statistics.totalNewSalary - statistics.totalCurrentSalary)}
                icon={<DollarSign className="w-4 h-4" />}
                variant="primary"
                titleSize="medium"
              />
              <StatCard
                title="Total % Variance"
                value={formatPercentage(statistics.totalPercentageChange)}
                icon={<TrendingUp className="w-4 h-4" />}
                variant="primary"
                titleSize="medium"
              />
            </div>
          </div>

          {/* Bottom Section - Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AMOUNT INCREASE ANALYSIS */}
            <div className="bg-white rounded-3xl shadow-sm border border-brand-200 p-6">
              <h2 className="text-xl font-semibold text-brand-700 mb-6 uppercase flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                AMOUNT INCREASE ANALYSIS
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <StatCard
                    title="Min Amount Increase"
                    value={formatCurrency(statistics.amountIncreaseAnalysis.minimum)}
                    icon={<DollarSign className="w-3 h-3" />}
                    titleSize="medium"
                  />
                  <StatCard
                    title="Max Amount Increase"
                    value={formatCurrency(statistics.amountIncreaseAnalysis.maximum)}
                    icon={<DollarSign className="w-3 h-3" />}
                    titleSize="medium"
                  />
                </div>
                <StatCard
                  title="Average Amount increase"
                  value={formatCurrency(statistics.amountIncreaseAnalysis.average)}
                  icon={<DollarSign className="w-4 h-4" />}
                  variant="primary"
                  titleSize="medium"
                />
              </div>
            </div>

            {/* % INCREASE ANALYSIS */}
            <div className="bg-white rounded-3xl shadow-sm border border-brand-200 p-6">
              <h2 className="text-xl font-semibold text-brand-700 mb-6 uppercase">% INCREASE ANALYSIS</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <StatCard
                    title="Min % Increase"
                    value={formatPercentage(statistics.percentageIncreaseAnalysis.minimum)}
                    icon={<TrendingUp className="w-3 h-3" />}
                    titleSize="medium"
                  />
                  <StatCard
                    title="Max % Increase"
                    value={formatPercentage(statistics.percentageIncreaseAnalysis.maximum)}
                    icon={<TrendingUp className="w-3 h-3" />}
                    titleSize="medium"
                  />
                </div>
                <StatCard
                  title="Average % increase"
                  value={formatPercentage(statistics.percentageIncreaseAnalysis.average)}
                  icon={<BarChart3 className="w-4 h-4" />}
                  variant="primary"
                  titleSize="medium"
                />
              </div>
            </div>
          </div>

          {/* Analysis Filter Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalysisFilterComponent
              title="Filter by Salary Increase"
              type="salary"
              placeholder="Enter amount"
              onFilter={(from, to) => handleAnalysisFilter('salary', from, to)}
              isLoading={isAnalysisLoading}
            />
            
            <AnalysisFilterComponent
              title="Filter by % Increase"
              type="percentage"
              placeholder="Enter percentage"
              onFilter={(from, to) => handleAnalysisFilter('percentage', from, to)}
              isLoading={isAnalysisLoading}
            />
          </div>

          {/* Analysis Results Table */}
          {showResultsTable && (
            <AnalysisResultsTable
              results={analysisResults}
              isLoading={isAnalysisLoading}
              currentFilter={currentFilter}
              onClearResults={handleClearResults}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

