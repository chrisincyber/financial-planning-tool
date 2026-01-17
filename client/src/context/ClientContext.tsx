import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Client } from '../types';
import { getAllClients, getClient } from '../db';

interface ClientContextType {
  clients: Client[];
  currentClient: Client | null;
  setCurrentClientId: (id: number | null) => void;
  refreshClients: () => Promise<void>;
  loading: boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [currentClientId, setCurrentClientId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshClients = async () => {
    const allClients = await getAllClients();
    setClients(allClients);
  };

  useEffect(() => {
    refreshClients().then(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (currentClientId) {
      getClient(currentClientId).then((client) => {
        setCurrentClient(client || null);
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
