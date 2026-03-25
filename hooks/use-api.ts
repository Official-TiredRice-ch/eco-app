import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch data from backend API
 */
export function useApi<T>(
  endpoint: string,
  dependencies: any[] = []
): UseApiState<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setState({ data: null, loading: true, error: null });
        const result = await apiService.get<T>(endpoint);
        
        if (isMounted) {
          setState({ data: result, loading: false, error: null });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
          });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return state;
}

/**
 * Hook to initialize backend connection
 */
export function useBackendConnection() {
  const [state, setState] = useState<UseApiState<string>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const connect = async () => {
      try {
        setState({ data: null, loading: true, error: null });
        const baseUrl = await apiService.discoverBackend();
        
        if (isMounted) {
          setState({ data: baseUrl, loading: false, error: null });
          console.log('✅ Connected to backend:', baseUrl);
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error('Connection failed'),
          });
          console.error('❌ Backend connection failed:', error);
        }
      }
    };

    connect();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
