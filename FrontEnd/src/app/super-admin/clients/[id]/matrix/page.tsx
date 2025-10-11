'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import MatrixHeader from '@/features/admin/matrix/components/MatrixHeader';
import CompaRatioMatrix from '@/features/admin/matrix/components/CompaRatioMatrix';
import { clientsService } from '@/lib/api';

export default function CompaRatioMatrixPage() {
  const params = useParams();
  const clientId = params.id as string;
  const [clientName, setClientName] = useState<string>('Loading...');
  const matrixRef = useRef<{
    saveChanges: () => void;
  } | null>(null);

  // Load client information
  useEffect(() => {
    const loadClientInfo = async () => {
      try {
        if (clientId) {
          const client = await clientsService.getClientAdminById(clientId);
          setClientName(client.companyName || client.contactPerson || 'Unnamed Client');
        }
      } catch (error) {
        console.error('Error loading client info:', error);
        setClientName('Unnamed Client');
      } finally {
        // Loading completed
      }
    };

    loadClientInfo();
  }, [clientId]);


  // Callback after save completes (no infinite loop)
  const handleSaveComplete = () => {
    console.log('Matrix save completed successfully');
    // You can add success notification here if needed
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <MatrixHeader 
        clientName={clientName} 
      />
      <div className="pt-8">
        <CompaRatioMatrix ref={matrixRef} clientId={clientId} onSaveChanges={handleSaveComplete} />
      </div>
    </div>
  );
}
