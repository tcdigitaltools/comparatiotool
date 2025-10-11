'use client';

import { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { BarChart3, Save, Check } from 'lucide-react';
import { matrixService } from '@/lib/api';

// Matrix grid structure: 3 performance ratings × 6 compa ratio ranges = 18 cells
// Each cell has 2 input fields (pctLt5Years, pctGte5Years) = 36 total inputs
interface MatrixCell {
  id: string;
  pctLt5Years: number;
  pctGte5Years: number;
  compaFrom: number;
  compaTo: number;
  perfBucket: number;
}

interface MatrixGrid {
  [key: string]: MatrixCell; // Key format: "perfBucket_compaRange" (e.g., "3_<70%")
}

interface CompaRatioMatrixProps {
  clientId: string;
  onSaveChanges: () => void;
}

const CompaRatioMatrix = forwardRef<{
  saveChanges: () => void;
}, CompaRatioMatrixProps>(({ clientId, onSaveChanges }, ref) => {
  const [matrixData, setMatrixData] = useState<MatrixGrid>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize matrix grid with default values
  const initializeMatrixGrid = useCallback(() => {
    const grid: MatrixGrid = {};
    const performanceRatings = [3, 2, 1]; // 3=Exceeds, 2=Meets, 1=Partially
    const compaRanges = ['<70%', '71-85%', '86-100%', '101-115%', '116-130%', '130%>'];
    
    performanceRatings.forEach(perf => {
      compaRanges.forEach(range => {
        const key = `${perf}_${range}`;
        const { compaFrom, compaTo } = getCompaRangeValues(range);
        grid[key] = { 
          id: '',
          pctLt5Years: 0, 
          pctGte5Years: 0,
          compaFrom,
          compaTo,
          perfBucket: perf
        };
      });
    });
    
    return grid;
  }, []);

  // Load matrix data from API
  const loadMatrixData = useCallback(async (clientId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const matrices = await matrixService.getClientMatrices(clientId);
      
      // Transform API data to grid format
      const grid = initializeMatrixGrid();
      
      matrices.forEach(matrix => {
        const rangeKey = getCompaRangeKey(matrix.compaFrom, matrix.compaTo);
        const key = `${matrix.perfBucket}_${rangeKey}`;
        
        
        // Convert to numbers to handle both number and string responses from API
        const pctLt5Years = typeof matrix.pctLt5Years === 'string' 
          ? parseFloat(matrix.pctLt5Years) 
          : matrix.pctLt5Years;
        const pctGte5Years = typeof matrix.pctGte5Years === 'string' 
          ? parseFloat(matrix.pctGte5Years) 
          : matrix.pctGte5Years;
        
        
        if (grid[key]) {
          grid[key] = {
            ...grid[key],
            id: matrix.id,
            pctLt5Years: pctLt5Years,
            pctGte5Years: pctGte5Years
          };
        } else {
        }
      });
      
      setMatrixData(grid);
    } catch {
      setError('Failed to load matrix data');
      setMatrixData(initializeMatrixGrid());
    } finally {
      setIsLoading(false);
    }
  }, [initializeMatrixGrid]);

  // Convert compa range to key format
  const getCompaRangeKey = (compaFrom: number | string, compaTo: number | string): string => {
    // Convert to numbers to handle both string and number inputs
    const from = typeof compaFrom === 'string' ? parseFloat(compaFrom) : compaFrom;
    const to = typeof compaTo === 'string' ? parseFloat(compaTo) : compaTo;
    
    if (from === 0.00 && to === 0.70) return '<70%';
    if (from === 0.71 && to === 0.85) return '71-85%';
    if (from === 0.86 && to === 1.01) return '86-100%';  // Fixed: backend uses 1.01, not 1.00
    if (from === 1.01 && to === 1.15) return '101-115%';
    if (from === 1.16 && to === 1.30) return '116-130%';
    if (from === 1.30 && to >= 9.99) return '130%>';
    return '<70%'; // fallback
  };

  // Handle input change (NO immediate save - only local state)
  const handleInputChange = (perfBucket: number, compaRange: string, field: 'pctLt5Years' | 'pctGte5Years', value: string) => {
    const key = `${perfBucket}_${compaRange}`;
    const numValue = parseFloat(value) || 0;
    
    // Update local state only - NO database save until "Save Changes" is clicked
    setMatrixData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: numValue
      }
    }));
  };

  // Get input value for a specific cell and field
  const getInputValue = (perfBucket: number, compaRange: string, field: 'pctLt5Years' | 'pctGte5Years'): string => {
    const key = `${perfBucket}_${compaRange}`;
    const cellData = matrixData[key];
    const value = cellData ? cellData[field].toString() : '0';
    
    
    return value;
  };


  // Save changes function (for bulk save button)
  const saveChanges = useCallback(async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      setError(null);
      
      
      // Save all matrix cells one by one (not all at once to avoid timeouts)
      const performanceRatings = [3, 2, 1];
      const compaRanges = ['<70%', '71-85%', '86-100%', '101-115%', '116-130%', '130%>'];
      
      let savedCount = 0;
      const totalCells = performanceRatings.length * compaRanges.length;
      
      for (const perf of performanceRatings) {
        for (const range of compaRanges) {
          const key = `${perf}_${range}`;
          const cellData = matrixData[key];
          
          if (cellData && cellData.id) {
            try {
              const updateData = {
                perfBucket: cellData.perfBucket,
                compaFrom: cellData.compaFrom,
                compaTo: cellData.compaTo,
                pctLt5Years: cellData.pctLt5Years,
                pctGte5Years: cellData.pctGte5Years,
                active: true
              };
              
              
              await matrixService.updateMatrix(cellData.id, clientId, updateData);
              
              savedCount++;
              
              // Small delay to prevent overwhelming the server
              if (savedCount < totalCells) {
                await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
              }
            } catch (cellError) {
              console.error(`Error saving cell ${key}:`, cellError);
              // Continue with other cells even if one fails
            }
          }
        }
      }
      
      setError(null);
      setSaveSuccess(true);
      onSaveChanges(); // Notify parent component
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
      
    } catch (err) {
      console.error('Error saving matrix data:', err);
      setError(`Failed to save matrix data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  }, [matrixData, clientId, onSaveChanges]);

  // Get compa range values for API
  const getCompaRangeValues = (range: string) => {
    switch (range) {
      case '<70%': return { compaFrom: 0.00, compaTo: 0.70 };
      case '71-85%': return { compaFrom: 0.71, compaTo: 0.85 };
      case '86-100%': return { compaFrom: 0.86, compaTo: 1.01 };  // Fixed: backend uses 1.01, not 1.00
      case '101-115%': return { compaFrom: 1.01, compaTo: 1.15 };
      case '116-130%': return { compaFrom: 1.16, compaTo: 1.30 };
      case '130%>': return { compaFrom: 1.30, compaTo: 9.99 };
      default: return { compaFrom: 0.00, compaTo: 0.70 };
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (clientId) {
      loadMatrixData(clientId);
    }
  }, [clientId, loadMatrixData]);

  // Debug: Monitor matrixData changes
  useEffect(() => {
  }, [matrixData]);

  // Expose save function to parent
  useImperativeHandle(ref, () => ({
    saveChanges
  }), [saveChanges]);

  // Matrix Input Cell Component
  const MatrixInputCell = ({ perfBucket, compaRange }: { perfBucket: number; compaRange: string }) => (
    <td className="px-4 py-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={getInputValue(perfBucket, compaRange, 'pctLt5Years')}
            onChange={(e) => handleInputChange(perfBucket, compaRange, 'pctLt5Years', e.target.value)}
            className="w-16 h-8 px-2 text-center border border-brand-200 rounded focus:outline-none focus:ring-2 focus:ring-brand-500 text-brand-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-brand-700">%</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={getInputValue(perfBucket, compaRange, 'pctGte5Years')}
            onChange={(e) => handleInputChange(perfBucket, compaRange, 'pctGte5Years', e.target.value)}
            className="w-16 h-8 px-2 text-center border border-brand-200 rounded focus:outline-none focus:ring-2 focus:ring-brand-500 text-brand-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-brand-700">%</span>
        </div>
      </div>
    </td>
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            <span className="ml-3 text-brand-700">Loading matrix data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button 
              onClick={() => loadMatrixData(clientId)}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg hover:from-brand-700 hover:to-brand-800"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Matrix Content Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
        {/* Main Content */}
        <div className="p-4">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-brand-700">Client Compa Ratio Matrix</h2>
              </div>
            </div>
            
            {/* Save Button */}
            <button 
              onClick={saveChanges}
              disabled={isLoading || isSaving}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                saveSuccess 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gradient-to-r from-brand-600 to-brand-700 text-white'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/60 border-t-white"></div>
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full">
                {/* Header Row */}
                <thead>
                  <tr className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-t-xl">
                    <th className="px-4 py-3 text-left text-white font-semibold rounded-tl-xl">Performance Rating</th>
                    <th className="px-4 py-3 text-center text-white font-semibold">&lt;70%</th>
                    <th className="px-4 py-3 text-center text-white font-semibold">71% - 85%</th>
                    <th className="px-4 py-3 text-center text-white font-semibold">86% - 100%</th>
                    <th className="px-4 py-3 text-center text-white font-semibold">101% - 115%</th>
                    <th className="px-4 py-3 text-center text-white font-semibold">116% - 130%</th>
                    <th className="px-4 py-3 text-center text-white font-semibold rounded-tr-xl">130%&gt;</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Row 1: Exceeds Targets */}
                  <tr className="border-b border-slate-200 hover:bg-brand-600/10 transition-colors duration-200">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-700 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">3</span>
                        </div>
                        <span className="font-semibold text-brand-700">Exceeds Targets</span>
                      </div>
                    </td>
                    <MatrixInputCell perfBucket={3} compaRange="<70%" />
                    <MatrixInputCell perfBucket={3} compaRange="71-85%" />
                    <MatrixInputCell perfBucket={3} compaRange="86-100%" />
                    <MatrixInputCell perfBucket={3} compaRange="101-115%" />
                    <MatrixInputCell perfBucket={3} compaRange="116-130%" />
                    <MatrixInputCell perfBucket={3} compaRange="130%>" />
                  </tr>

                  {/* Row 2: Meets Targets */}
                  <tr className="border-b border-slate-200 hover:bg-brand-500/10 transition-colors duration-200">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">2</span>
                        </div>
                        <span className="font-semibold text-brand-700">Meets Targets</span>
                      </div>
                    </td>
                    <MatrixInputCell perfBucket={2} compaRange="<70%" />
                    <MatrixInputCell perfBucket={2} compaRange="71-85%" />
                    <MatrixInputCell perfBucket={2} compaRange="86-100%" />
                    <MatrixInputCell perfBucket={2} compaRange="101-115%" />
                    <MatrixInputCell perfBucket={2} compaRange="116-130%" />
                    <MatrixInputCell perfBucket={2} compaRange="130%>" />
                  </tr>

                  {/* Row 3: Partially Meets Targets */}
                  <tr className="hover:bg-brand-400/10 transition-colors duration-200">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-400 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">1</span>
                        </div>
                        <span className="font-semibold text-brand-700">Partially Meets Targets</span>
                      </div>
                    </td>
                    <MatrixInputCell perfBucket={1} compaRange="<70%" />
                    <MatrixInputCell perfBucket={1} compaRange="71-85%" />
                    <MatrixInputCell perfBucket={1} compaRange="86-100%" />
                    <MatrixInputCell perfBucket={1} compaRange="101-115%" />
                    <MatrixInputCell perfBucket={1} compaRange="116-130%" />
                    <MatrixInputCell perfBucket={1} compaRange="130%>" />
                  </tr>
                </tbody>
              </table>
          </div>
        </div>
      </div>
    </div>
  );
});

CompaRatioMatrix.displayName = 'CompaRatioMatrix';

export default CompaRatioMatrix;