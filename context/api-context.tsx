import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '@/services/api';

interface ApiContextType {
  baseUrl: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
  reconnect: () => Promise<void>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const connect = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const url = await apiService.rediscover();
      setBaseUrl(url);
      setIsConnected(true);
      console.log('✅ API Context: Connected to', url);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Connection failed');
      setError(error);
      setIsConnected(false);
      setBaseUrl(apiService.getCurrentUrl()); // Show the URL we're trying to use
      console.error('❌ API Context: Connection failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    connect();
  }, []);

  const value: ApiContextType = {
    baseUrl,
    isConnected,
    isLoading,
    error,
    reconnect: connect,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApiContext() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApiContext must be used within ApiProvider');
  }
  return context;
}
