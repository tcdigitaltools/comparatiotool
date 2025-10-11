'use client';

import { AuthLayout, CalculatorLayout } from '@/components';
import CompaRatioCalculator from '@/features/calculator/components/CompaRatioCalculator';
import { CalculatorProvider } from '@/contexts/CalculatorContext';

export default function CalculatorPage() {
  return (
    <AuthLayout requireAuth={true} allowedRoles={['CLIENT_ADMIN']}>
      <CalculatorProvider>
        <CalculatorLayout>
          <CompaRatioCalculator />
        </CalculatorLayout>
      </CalculatorProvider>
    </AuthLayout>
  );
}