import { useState, useCallback } from 'react';
import { apiService } from '@/services/api';

interface SearchResult {
  id: number;
  name: string;
  price: number;
  rating?: number;
  source: 'local' | 'google' | 'shopee' | 'lazada';
  url?: string;
  image?: string;
  [key: string]: any;
}

interface HybridSearchState {
  results: SearchResult[];
  loading: boolean;
  error: Error | null;
  breakdown: {
    local: number;
    online: number;
  };
}

/**
 * Hook for hybrid search (local + online)
 */
export function useHybridSearch() {
  const [state, setState] = useState<HybridSearchState>({
    results: [],
    loading: false,
    error: null,
    breakdown: { local: 0, online: 0 },
  });

  const search = useCallback(
    async (query: string, includeOnline: boolean = false, sources: string[] = ['google', 'shopee', 'lazada']) => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const params = new URLSearchParams({
          query,
          includeOnline: includeOnline.toString(),
          sources: sources.join(','),
        });

        const response = await apiService.get<{
          query: string;
          resultCount: number;
          results: SearchResult[];
          breakdown: { local: number; online: number };
        }>(`/api/search/hybrid?${params}`);

        setState({
          results: response.results || [],
          loading: false,
          error: null,
          breakdown: response.breakdown || { local: 0, online: 0 },
        });

        return response.results;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Search failed');
        setState(prev => ({
          ...prev,
          loading: false,
          error: err,
        }));
        throw err;
      }
    },
    []
  );

  return {
    ...state,
    search,
  };
}

/**
 * Hook for local search only
 */
export function useLocalSearch() {
  const [state, setState] = useState<HybridSearchState>({
    results: [],
    loading: false,
    error: null,
    breakdown: { local: 0, online: 0 },
  });

  const search = useCallback(async (query: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await apiService.get<{
        query: string;
        resultCount: number;
        results: SearchResult[];
      }>(`/api/search/products?query=${encodeURIComponent(query)}`);

      setState({
        results: response.results || [],
        loading: false,
        error: null,
        breakdown: { local: response.results?.length || 0, online: 0 },
      });

      return response.results;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Search failed');
      setState(prev => ({
        ...prev,
        loading: false,
        error: err,
      }));
      throw err;
    }
  }, []);

  return {
    ...state,
    search,
  };
}
