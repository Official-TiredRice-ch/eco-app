import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DISCOVERY_TIMEOUT = 3000; // Reduced timeout for built apps
const CACHE_KEY = 'backend_url';
const CACHE_DURATION = 3600000; // 1 hour

// Multiple backend URLs to try (in order of preference)
const BACKEND_URLS = [
  'http://192.168.1.30:24365',  // Your specific IP
  'http://192.168.0.30:24365',  // Alternative network
  'http://192.168.1.1:24365',   // Router IP sometimes
  'http://10.0.0.30:24365',     // Another common network
  'http://localhost:24365',     // Localhost fallback
];

interface DiscoveryResponse {
  server: string;
  version: string;
  ip: string;
  port: number;
  baseUrl: string;
  timestamp: string;
}

class APIService {
  private baseUrl: string | null = null;
  private lastDiscoveryTime: number = 0;

  /**
   * Try multiple backend URLs until one works
   */
  async discoverBackend(): Promise<string> {
    console.log('🔍 Starting backend discovery...');
    
    try {
      // Check cache first
      const cached = await this.getCachedBackendUrl();
      if (cached) {
        console.log('📦 Using cached backend URL:', cached);
        // Don't verify cached URL - just use it and let requests fail/retry if needed
        this.baseUrl = cached;
        return cached;
      }

      // Try each URL in order - but don't wait for health check
      // Just use the first URL and let the actual API requests determine if it works
      console.log('🔗 Using primary backend URL:', BACKEND_URLS[0]);
      const primaryUrl = BACKEND_URLS[0];
      await this.cacheBackendUrl(primaryUrl);
      this.baseUrl = primaryUrl;
      return primaryUrl;

    } catch (error) {
      console.error('❌ Discovery error:', error);
      // Even if everything fails, use the primary URL
      const fallbackUrl = BACKEND_URLS[0];
      this.baseUrl = fallbackUrl;
      return fallbackUrl;
    }
  }

  /**
   * Try network discovery (original method)
   */
  private async tryNetworkDiscovery(): Promise<string | null> {
    try {
      // Get device IP info
      const ipAddress = await Network.getIpAddressAsync();
      console.log('📱 Device IP:', ipAddress);

      if (!ipAddress || ipAddress === '127.0.0.1') {
        console.log('⚠️ Invalid device IP, skipping network discovery');
        return null;
      }

      // Extract network prefix (e.g., 192.168.1 from 192.168.1.100)
      const networkPrefix = ipAddress.substring(0, ipAddress.lastIndexOf('.'));
      console.log('🌐 Network prefix:', networkPrefix);

      // Try to find backend on the network
      return await this.scanNetwork(networkPrefix);
    } catch (error) {
      console.log('⚠️ Network discovery failed:', error);
      return null;
    }
  }

  /**
   * Scan network for backend server
   */
  private async scanNetwork(networkPrefix: string): Promise<string | null> {
    const port = 24365;
    const commonIPs = [30, 1, 2, 100, 101, 102]; // Most common device IPs

    for (const ip of commonIPs) {
      const url = `http://${networkPrefix}.${ip}:${port}`;
      try {
        const response = await this.checkBackendHealth(url, 2000); // Faster timeout for scanning
        if (response) {
          console.log('🎯 Network scan found backend at:', url);
          return url;
        }
      } catch (error) {
        // Continue scanning
      }
    }

    return null;
  }

  /**
   * Check if backend is healthy at given URL
   */
  private async checkBackendHealth(url: string, timeout: number = DISCOVERY_TIMEOUT): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${url}/health`, { 
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      // Don't log every failed health check - it's expected during discovery
      return false;
    }
  }

  /**
   * Get cached backend URL if still valid
   */
  private async getCachedBackendUrl(): Promise<string | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { url, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      if (age < CACHE_DURATION) {
        return url;
      }

      // Cache expired, remove it
      await AsyncStorage.removeItem(CACHE_KEY);
      return null;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  /**
   * Cache backend URL
   */
  private async cacheBackendUrl(url: string): Promise<void> {
    try {
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          url,
          timestamp: Date.now(),
        })
      );
      console.log('💾 Cached backend URL:', url);
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  /**
   * Get base URL (discover if needed)
   */
  async getBaseUrl(): Promise<string> {
    if (this.baseUrl) {
      return this.baseUrl;
    }
    return this.discoverBackend();
  }

  /**
   * Make API request with retry logic
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    let lastError: Error | null = null;

    // Try up to 2 times
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const baseUrl = await this.getBaseUrl();
        const url = `${baseUrl}${endpoint}`;

        console.log(`📡 API Request (attempt ${attempt}):`, url);

        // Don't use AbortController - it's causing issues in built apps
        // Just use a simple fetch with no timeout
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers,
          },
        });

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Response error:', errorText);
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Request successful, data received');
        return data;
      } catch (error) {
        console.error(`❌ API Request failed (attempt ${attempt}):`, error);
        console.error('Error details:', {
          name: (error as Error).name,
          message: (error as Error).message,
          stack: (error as Error).stack?.substring(0, 200)
        });
        lastError = error as Error;
        
        // If this attempt failed and we have more attempts, wait a bit before retrying
        if (attempt < 2) {
          console.log('⏳ Waiting 2 seconds before retry...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    console.error('❌ All attempts failed. Last error:', lastError);
    throw lastError || new Error('All API request attempts failed');
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Clear cached backend URL
   */
  async clearCache(): Promise<void> {
    await AsyncStorage.removeItem(CACHE_KEY);
    this.baseUrl = null;
    console.log('🗑️ Cache cleared');
  }

  /**
   * Force rediscovery
   */
  async rediscover(): Promise<string> {
    await this.clearCache();
    this.baseUrl = null;
    return this.discoverBackend();
  }

  /**
   * Get current backend URL (for display purposes)
   */
  getCurrentUrl(): string | null {
    return this.baseUrl;
  }
}

export const apiService = new APIService();
