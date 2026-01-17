import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Client } from '../types';
import { clientsService } from '../services/clients.service';
import { useAuth } from './AuthContext';

interface ClientContextType {
  clients: Client[];
  currentClient: Client | null;
  setCurrentClientId: (id: string | null) => void;
  refreshClients: () => Promise<void>;
  loading: boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: ReactNode }) {
  const { user, profile, isAdvisor } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshClients = async () => {
    if (!user) {
      setClients([]);
      setLoading(false);
      return;
    }

    try {
      const allClients = await clientsService.getAll();
      setClients(allClients);

      // For client users (non-advisors), auto-select their linked client
      if (!isAdvisor && allClients.length === 1) {
        setCurrentClientId(allClients[0].id!);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshClients();
    } else {
      setClients([]);
      setCurrentClient(null);
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    if (currentClientId) {
      clientsService.getById(currentClientId).then((client) => {
        setCurrentClient(client);
      });
    } else {
      setCurrentClient(null);
    }
  }, [currentClientId]);

  return (
    <ClientContext.Provider
      value={{
        clients,
        currentClient,
        setCurrentClientId,
        refreshClients,
        loading,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export function useClients() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
}
