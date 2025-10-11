'use client';

import { useState, useEffect } from 'react';
import { Calculator, Upload, TrendingUp, Loader2, Download, FileSpreadsheet, AlertCircle, ChevronDown } from 'lucide-react';
import { useCalculator } from '../hooks/useCalculator';
import { CalcRequest, ProfileResponse } from '@/lib/api/types';
import { calculatorService, authService } from '@/lib/api';
import { useCalculatorContext } from '@/contexts/CalculatorContext';
import { DashboardContent } from '@/features/dashboard/components/DashboardContent';

export default function CompaRatioCalculator() {
  const { activeTab } = useCalculatorContext();
  const [ratingScale, setRatingScale] = useState('3');
  const [isPerformanceDropdownOpen, setIsPerformanceDropdownOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<ProfileResponse | null>(null);

  const [formData, setFormData] = useState({
    employeeCode: '',
    employeeName: '',
    jobTitle: '',
    performanceRating: '',
    midOfScale: '',
    yearsOfExperience: '',
    currentSalary: ''
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const [bulkResults, setBulkResults] = useState<{
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
  }[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalElements, setTotalElements] = useState<number>(0);
  
  const [downloadedExcelFile, setDownloadedExcelFile] = useState<Blob | null>(null);

  const { 
    isLoading: isCalculating, 
    error: calculationError, 
    result: calculationResult,
    calculateIndividual,
    calculateBulk,
    clearError
  } = useCalculator();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await authService.getCurrentProfile();
        setUserProfile(profile);
        
        const defaultRating = profile.performanceRatingScale === 'THREE_POINT' ? '2' : '3';
        setRatingScale(defaultRating);
        setFormData(prev => ({ ...prev, performanceRating: defaultRating }));
      } catch (error) {
      }
    };

    fetchUserProfile();
  }, []);


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getPerformanceRatingOptions = () => {
    const userScale = userProfile?.performanceRatingScale;
    
    if (userScale === 'THREE_POINT') {
      return [
        { value: '1', label: '1-Partially Meets Targets' },
        { value: '2', label: '2-Meets Targets' },
        { value: '3', label: '3-Exceeds Targets' }
      ];
    } else {
      return [
        { value: '1', label: '1-Does Not Meet Expectations' },
        { value: '2', label: '2-Below Expectations' },
        { value: '3', label: '3-Meets Expectations' },
        { value: '4', label: '4-Exceeds Expectations' },
        { value: '5', label: '5-Outstanding' }
      ];
    }
  };


  // Bulk upload functions
  const downloadTemplate = () => {
    // Create CSV template with headers
    const headers = [
      'Employee Code',
      'Employee Name', 
      'Job Title',
      'Years of Experience',
      'Performance',
      'Current Salary',
      'Mid of Scale'
    ];
    
    const csvContent = headers.join(',') + '\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compa-ratio-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      setUploadError('Please upload a valid Excel file (.xlsx, .xls) or CSV file.');
      return;
    }

    setUploadedFile(file);
    setUploadError(null);
    
    processExcelFile(file);
  };

  const processExcelFile = async (file: File) => {
    setUploadError(null);
    clearError();

    try {
      const response = await calculateBulk(file);
      
      if (response && response instanceof Blob) {
        setDownloadedExcelFile(response);
        
        await fetchBulkResults(0, pageSize);
        
        const fileInput = document.querySelector('input[type="file"][accept*="xlsx"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as { message?: string }).message 
        : 'Error processing file. Please check the format and try again.';
      setUploadError(errorMessage || 'Error processing file. Please check the format and try again.');
    }
  };

  // Fetch bulk results with pagination
  const fetchBulkResults = async (page: number, size: number) => {      
    try {
      const response = await calculatorService.getBulkResults(page, size);
      
      const typedResponse = response as {
        rows: {
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
        }[];
        totalPages: number;
        pageNumber: number;
        totalElements: number;
      };
      setBulkResults(typedResponse.rows || []);
      setTotalPages(typedResponse.totalPages || 0);
      setTotalElements(typedResponse.totalElements || 0);
    } catch (error) {
      console.error('Error fetching bulk results:', error);
      setUploadError('Error fetching results. Please try again.');
    } finally {
    }
  };

  const downloadBulkResults = () => {
    if (!downloadedExcelFile) {
      return;
    }


    const url = window.URL.createObjectURL(downloadedExcelFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-calculation-results.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchBulkResults(newPage - 1, pageSize);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    fetchBulkResults(0, newSize);
  };

  const calculateCompaRatio = async () => {
    
    clearError();

    if (!formData.currentSalary || !formData.midOfScale || !formData.yearsOfExperience || !formData.performanceRating) {
      return;
    }

    const calcRequest: CalcRequest = {
      currentSalary: parseFloat(formData.currentSalary),
      midOfScale: parseFloat(formData.midOfScale),
      yearsExperience: parseInt(formData.yearsOfExperience),
      performanceRating: parseInt(formData.performanceRating),
      employeeCode: formData.employeeCode || undefined,
      jobTitle: formData.jobTitle || undefined,
      asOf: new Date().toISOString().split('T')[0],
    };


    try {
      await calculateIndividual(calcRequest);
    } catch {
    }
  };


  return (
    <div className="space-y-8">
      {/* Individual Calculator */}
      {activeTab === 'individual' && (
        <div className="bg-white/90 backdrop-blur-md hover:shadow-xl border border-brand-200 shadow-lg rounded-3xl p-8">
            <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Individual Employee Calculator</h3>
                  
                </div>
              </div>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-6">
              <div className="animate-slide-in-left">
                <label className="block text-base font-semibold mb-3 text-brand-700">Employee Code</label>
                <input
                  type="text"
                  value={formData.employeeCode}
                  onChange={(e) => handleInputChange('employeeCode', e.target.value)}
                  placeholder="EMP001"
                  className="w-full h-12 bg-brand-50/50 border border-brand-200 text-brand-700 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent rounded-xl px-4 placeholder:text-gray-400"
                />
              </div>

              <div className="animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
                <label className="block text-base font-semibold mb-3 text-brand-700">Job Title</label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  placeholder="Manager"
                  className="w-full h-12 bg-brand-50/50 border border-brand-200 text-brand-700 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent rounded-xl px-4 placeholder:text-gray-400"
                />
              </div>

              <div className="animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
                <label className="block text-base font-semibold mb-3 text-brand-700">Performance Rating</label>
                <div className="relative">
                  <button
                    onClick={() => setIsPerformanceDropdownOpen(!isPerformanceDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 border border-brand-300 rounded-lg hover:border-brand-400 transition-colors h-12 bg-brand-50/50 text-brand-700"
                  >
                    <span className="text-brand-700">
                      {getPerformanceRatingOptions().find(option => option.value === ratingScale)?.label || 'Select Rating'}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-brand-600 transition-transform ${isPerformanceDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isPerformanceDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                      {getPerformanceRatingOptions().map((option) => {
                        const isSelected = ratingScale === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              setRatingScale(option.value);
                              setFormData(prev => ({ ...prev, performanceRating: option.value }));
                              setIsPerformanceDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                              isSelected ? 'bg-brand-500 text-white' : 'text-slate-800'
                            }`}
                          >
                            <span>{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="animate-slide-in-left" style={{ animationDelay: '0.3s' }}>
                <label className="block text-base font-semibold mb-3 text-brand-700">Mid of Scale</label>
                <input
                  type="number"
                  value={formData.midOfScale}
                  onChange={(e) => handleInputChange('midOfScale', e.target.value)}
                  placeholder="65000"
                  className="w-full h-12 bg-brand-50/50 border border-brand-200 text-brand-700 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent rounded-xl px-4 placeholder:text-gray-400"
                />
                <p className="text-sm text-brand-600 mt-2">The midpoint of the salary scale for this position</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="animate-slide-in-right">
                <label className="block text-base font-semibold mb-3 text-brand-700">Employee Name</label>
                <input
                  type="text"
                  value={formData.employeeName}
                  onChange={(e) => handleInputChange('employeeName', e.target.value)}
                  placeholder="John Doe"
                  className="w-full h-12 bg-brand-50/50 border border-brand-200 text-brand-700 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent rounded-xl px-4 placeholder:text-gray-400"
                />
              </div>

              <div className="animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
                <label className="block text-base font-semibold mb-3 text-brand-700">Years of Experience</label>
                <input
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                  placeholder="5"
                  className="w-full h-12 bg-brand-50/50 border border-brand-200 text-brand-700 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent rounded-xl px-4 placeholder:text-gray-400"
                />
              </div>

              <div className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
                <label className="block text-base font-semibold mb-3 text-brand-700">Current Salary</label>
                <input
                  type="number"
                  value={formData.currentSalary}
                  onChange={(e) => handleInputChange('currentSalary', e.target.value)}
                  placeholder="50000"
                  className="w-full h-12 bg-brand-50/50 border border-brand-200 text-brand-700 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent rounded-xl px-4 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <div className="animate-slide-up mb-8" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={calculateCompaRatio}
              disabled={isCalculating}
              className="w-full h-16 text-lg font-bold bg-gradient-to-r from-brand-600 to-brand-700 hover:shadow-lg border-0 hover:-translate-y-1 transition-all duration-300 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center text-white"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin text-white" />
                  <span className="text-white">Calculating Compa Ratio...</span>
                </>
              ) : (
                <>
                  <Calculator className="mr-3 h-6 w-6 text-white" />
                  <span className="text-white">Calculate Compa Ratio</span>
                </>
              )}
            </button>
          </div>

          {/* Premium Loading Animation */}
          {isCalculating && (
            <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
              <div className="relative mb-8">
                {/* Outer rotating ring with gradient */}
                <div className="w-32 h-32 rounded-full bg-brand-500 p-1 animate-spin">
                  <div className="w-full h-full rounded-full bg-white"></div>
                </div>
                
                {/* Inner glowing core */}
                <div className="absolute inset-6 w-20 h-20 bg-brand-500 rounded-full animate-pulse-glow flex items-center justify-center">
                  <Calculator className="h-8 w-8 text-white animate-pulse" />
                </div>
                
                {/* Floating orbits */}
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
                  <div className="absolute top-2 left-1/2 w-3 h-3 bg-brand-500 rounded-full transform -translate-x-1/2 animate-pulse"></div>
                </div>
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
                  <div className="absolute bottom-2 left-1/2 w-2 h-2 bg-accent rounded-full transform -translate-x-1/2 animate-pulse"></div>
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-xl font-bold bg-brand-500 bg-clip-text text-transparent">Processing Calculation</p>
                <p className="text-brand-600">Analyzing performance metrics and salary data...</p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {calculationError && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800">{calculationError}</span>
            </div>
          )}

          {/* Results */}
          {calculationResult && !isCalculating && (
            <div className="bg-white/90 backdrop-blur-md border border-brand-200 shadow-xl animate-fade-in hover:-translate-y-1 rounded-2xl p-8 mt-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-brand-500 bg-clip-text text-transparent">Calculation Results</h3>
                  <p className="text-base text-brand-600">Based on the compa ratio matrix analysis</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Employee Details */}
                <div className="bg-white border border-brand-200 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full"></div>
                    <h3 className="text-lg font-bold text-brand-800">Employee Details</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-1 border-b border-brand-100">
                      <span className="text-brand-600 text-sm font-medium">Code:</span>
                      <span className="font-bold text-brand-800 text-sm bg-brand-50 px-2 py-1 rounded-md">{formData.employeeCode || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-brand-100">
                      <span className="text-brand-600 text-sm font-medium">Title:</span>
                      <span className="font-bold text-brand-800 text-sm bg-brand-50 px-2 py-1 rounded-md">{formData.jobTitle || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-brand-600 text-sm font-medium">Experience:</span>
                      <span className="font-bold text-brand-800 text-sm bg-brand-50 px-2 py-1 rounded-md">{formData.yearsOfExperience} years</span>
                    </div>
                  </div>
                </div>

                {/* Current Status */}
                <div className="bg-white border border-brand-200 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full"></div>
                    <h3 className="text-lg font-bold text-brand-800">Current Status</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-1 border-b border-brand-100">
                      <span className="text-brand-600 text-sm font-medium">Current Salary:</span>
                      <span className="font-bold text-brand-800 text-sm bg-brand-50 px-2 py-1 rounded-md">{parseFloat(formData.currentSalary).toLocaleString()}$</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-brand-100">
                      <span className="text-brand-600 text-sm font-medium">New Salary:</span>
                      <span className="font-bold text-brand-700 text-sm bg-brand-50 px-2 py-1 rounded-md">{calculationResult.newSalary.toLocaleString()}$</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-brand-600 text-sm font-medium">Increase Amount:</span>
                      <span className="font-bold text-brand-800 text-sm bg-brand-50 px-2 py-1 rounded-md">{(calculationResult.newSalary - parseFloat(formData.currentSalary)).toLocaleString()}$</span>
                    </div>
                  </div>
                </div>

                {/* Recommended Increase */}
                <div className="bg-gradient-to-br from-brand-600 to-brand-700 p-6 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300">
                  <div className="text-center">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-white mb-6 tracking-wide">Recommended Increase</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="text-4xl font-bold text-white mb-3 tracking-tight drop-shadow-lg">
                        {calculationResult.increasePct.toFixed(1)}%
                      </div>
                      <div className="text-white/90 text-base font-semibold tracking-wide">
                        Salary Increase
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bulk Upload */}
      {activeTab === 'bulk' && (
        <div className="space-y-8">
          {/* Upload Section */}
          <div className="bg-white/90 backdrop-blur-md hover:shadow-xl border border-brand-200 shadow-lg rounded-3xl p-8">
            <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Bulk Excel Upload</h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Download Template */}
              <div className="bg-brand-50/50 rounded-3xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <FileSpreadsheet className="h-5 w-5 text-brand-500" />
                  <h4 className="font-bold text-brand-700">Download Template</h4>
                </div>
                <p className="text-brand-600 mb-6 text-sm">Get the Excel template with required column headers</p>
                <button 
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-50/50 border border-brand-300 text-brand-700 hover:bg-brand-100 hover:shadow-lg transition-all duration-300 rounded-xl font-semibold"
                >
                  <Download className="h-5 w-5" />
                  Download Template
                </button>
              </div>

              {/* Upload Data */}
              <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-3xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="h-5 w-5 text-white" />
                  <h4 className="font-bold text-white">Upload Data</h4>
                </div>
                <p className="text-white/90 mb-6 text-sm">Upload your Excel file with employee data</p>
                <div className="flex items-center gap-3">
                  <label className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-6 py-3 rounded-xl hover:bg-white/30 hover:shadow-lg transition-all duration-300 font-semibold cursor-pointer">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    Choose File
                  </label>
                  <span className="text-sm text-white/90">
                    {uploadedFile ? uploadedFile.name : 'No file chosen'}
                  </span>
                </div>
              </div>
            </div>

            {uploadError && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800">{uploadError}</span>
              </div>
            )}

            {isCalculating && (
              <div className="mt-8 flex flex-col items-center justify-center py-16 animate-fade-in">
                <div className="relative mb-8">
                  <div className="w-32 h-32 rounded-full bg-brand-500 p-1 animate-spin">
                    <div className="w-full h-full rounded-full bg-white"></div>
                  </div>
                  <div className="absolute inset-6 w-20 h-20 bg-brand-500 rounded-full animate-pulse-glow flex items-center justify-center">
                    <FileSpreadsheet className="h-8 w-8 text-white animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xl font-bold bg-brand-500 bg-clip-text text-transparent">Processing Excel File</p>
                  <p className="text-brand-600">Analyzing employee data and calculating compa ratios...</p>
                </div>
              </div>
            )}
          </div>

          {bulkResults && bulkResults.length > 0 && !isCalculating && (
            <div className="bg-white/90 backdrop-blur-md border border-brand-200 shadow-xl rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-brand-500 bg-clip-text text-transparent">Calculation Results</h3>
                    <p className="text-base text-brand-600">
                      {totalElements} employees processed successfully
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-brand-700">Show:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
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
                    onClick={downloadBulkResults}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
                  >
                    <Download className="h-5 w-5" />
                    Download Results
                  </button>
                </div>
              </div>

              {/* Results Table */}
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
                    {bulkResults.map((employee, index) => {
                      const currentSalary = employee.currentSalary || 0;
                      const newSalary = employee.newSalary || 0;
                      const increaseAmount = employee.increaseAmount || 0;
                      
                      return (
                        <tr key={index} className={`border-b border-brand-100 ${index % 2 === 0 ? 'bg-brand-50/30' : 'bg-white'} hover:bg-brand-50`}>
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
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalElements)} of {totalElements} results
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-brand-300 rounded-md hover:bg-brand-50 disabled:opacity-50 disabled:cursor-not-allowed text-brand-700"
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm border rounded-md ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white border-brand-600'
                              : 'border-brand-300 hover:bg-brand-50 text-brand-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm border border-brand-300 rounded-md hover:bg-brand-50 disabled:opacity-50 disabled:cursor-not-allowed text-brand-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'dashboard' && (
        <DashboardContent />
      )}
    </div>
  );
}