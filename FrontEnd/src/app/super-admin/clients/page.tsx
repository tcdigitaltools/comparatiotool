'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import ClientCard from '@/features/admin/clients/components/ClientCard';
import { useAuth } from '@/shared/hooks/useAuth';
import { clientsService } from '@/lib/api/services/clients';

type ClientItem = {
  id: string;
  name: string;
  contactName: string;
  email: string;
  industry: string;
  ratingScale: string; // e.g., "5/5"
  active: boolean;
};

export default function ClientsPage() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Load clients from API - no hardcoded data
  const [clients, setClients] = useState<ClientItem[]>([]);

  // Redirect if not authenticated or not super admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'SUPER_ADMIN')) {
      window.location.href = '/';
    }
  }, [isAuthenticated, isLoading, user]);

  // Load clients from API only (no localStorage)
  useEffect(() => {
    const loadClients = async () => {
      try {
        // Load from API only
        const apiClients = await clientsService.getAllClientAdmins();
        
        // Transform API data to match our ClientItem type
        const transformedClients: ClientItem[] = apiClients.map(client => ({
          id: client.id,
          name: client.companyName || '',
          contactName: client.contactPerson || '',
          email: client.email || '',
          industry: client.industry || '',
          ratingScale: client.ratingScale || '5/5',
          active: client.active ?? false
        }));
        
        setClients(transformedClients);
      } catch (error) {
        console.error('Error loading clients from API:', error);
        // Show empty list on error - no localStorage fallback
        setClients([]);
        // Could add user notification here in production
      }
    };

    loadClients();
  }, []);

  // Refresh client data when returning to page (production-friendly)
  useEffect(() => {
    const handleFocus = async () => {
      try {
        // Reload fresh data from API on window focus
        const apiClients = await clientsService.getAllClientAdmins();
        const transformedClients: ClientItem[] = apiClients.map(client => ({
          id: client.id,
          name: client.companyName || '',
          contactName: client.contactPerson || '',
          email: client.email || '',
          industry: client.industry || '',
          ratingScale: client.ratingScale || '5/5',
          active: client.active ?? false
        }));
        setClients(transformedClients);
      } catch (error) {
        console.error('Error refreshing clients data:', error);
        // Don't update state on refresh error to avoid clearing existing data
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const count = clients.length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'SUPER_ADMIN') {
    return null;
  }

  const toggleClient = async (id: string) => {
    try {
      // Call the toggle status API endpoint
      const updatedUser = await clientsService.toggleClientStatus(id);

      // Update the clients list with the response from the API
      const updatedClients = clients.map(c => 
        c.id === id 
          ? { 
              ...c, 
              active: updatedUser.active ?? !c.active,
              name: updatedUser.companyName || c.name,
              contactName: updatedUser.contactPerson || c.contactName,
              email: updatedUser.email || c.email,
              industry: updatedUser.industry || c.industry,
              ratingScale: updatedUser.ratingScale || c.ratingScale
            } 
          : c
      );
      
      setClients(updatedClients);
      console.log(`Client ${id} ${updatedUser.active ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling client status:', error);
      // Show user-friendly error message
      console.warn('Failed to update client status. Please try again.');
    }
  };

  const viewClient = (id: string) => {
    // TODO: Navigate to client detail page
    console.log('Viewing client:', id);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      {/* Main rounded container */}
      <section className="rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
        {/* Section header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-[18px] font-semibold text-brand-700">
              Client Accounts
            </h2>
            {/* Dynamic Count Badge */}
            <div className="inline-flex items-center justify-center min-w-[2rem] h-8 px-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-bold rounded-full shadow-sm">
              {count}
            </div>
          </div>

          <Link
            href="/super-admin/clients/new"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 h-11 px-5 text-sm font-medium text-white shadow-sm hover:from-brand-700 hover:to-brand-800 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-brand-400/60 transition"
          >
            + Create Client User
          </Link>
        </div>

        {/* List */}
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {clients.length > 0 ? (
            clients.map((client) => (
              <ClientCard
                key={client.id}
                {...client}
                onToggle={toggleClient}
                onView={viewClient}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No client accounts found.</p>
              <p className="text-sm text-gray-400 mt-1">Try refreshing the page or check your connection.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
