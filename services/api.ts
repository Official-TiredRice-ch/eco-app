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
        // Verify cached URL still works
        const isHealthy = await this.checkBackendHealth(cached, 2000);
        if (isHealthy) {
          this.baseUrl = cached;
          return cached;
        } else {
          console.log('⚠️ Cached URL not responding, clearing cache');
          await this.clearCache();
        }
      }

      // Try each URL in order
      for (let i = 0; i < BACKEND_URLS.length; i++) {
        const url = BACKEND_URLS[i];
        console.log(`🔗 Trying backend ${i + 1}/${BACKEND_URLS.length}: ${url}`);
        
        const isHealthy = await this.checkBackendHealth(url, DISCOVERY_TIMEOUT);
        if (isHealthy) {
          console.log('✅ Backend found at:', url);
          await this.cacheBackendUrl(url);
          this.baseUrl = url;
          return url;
        } else {
          console.log(`❌ No response from ${url}`);
        }
      }

      // If no URL works, try network discovery as fallback
      console.log('🌐 Trying network discovery as fallback...');
      const discoveredUrl = await this.tryNetworkDiscovery();
      if (discoveredUrl) {
        await this.cacheBackendUrl(discoveredUrl);
        this.baseUrl = discoveredUrl;
        return discoveredUrl;
      }

      // Last resort: use the first URL anyway (maybe health endpoint doesn't work)
      console.log('🔄 Using first URL as last resort...');
      const fallbackUrl = BACKEND_URLS[0];
      this.baseUrl = fallbackUrl;
      return fallbackUrl;

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

    // Try up to 3 times with different URLs if needed
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const baseUrl = await this.getBaseUrl();
        const url = `${baseUrl}${endpoint}`;

        console.log(`📡 API Request (attempt ${attempt}):`, url);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);
        console.log('📥 Response status:', response.status);

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Request successful');
        return data;
      } catch (error) {
        console.error(`❌ API Request failed (attempt ${attempt}):`, error);
        lastError = error as Error;
        
        // If this attempt failed, clear the cached URL and try discovery again
        if (attempt < 3) {
          console.log('🔄 Retrying with fresh discovery...');
          await this.clearCache();
          this.baseUrl = null;
        }
      }
    }

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
