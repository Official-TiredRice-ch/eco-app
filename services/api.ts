import * as Network from 'expo-network';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DISCOVERY_TIMEOUT = 5000;
const CACHE_KEY = 'backend_url';
const CACHE_DURATION = 3600000; // 1 hour
const MANUAL_IP_KEY = 'manual_backend_ip';

// Change this to your backend IP if you want to use a specific one
// Leave as null to auto-discover
const MANUAL_BACKEND_IP: string | null = '192.168.1.30'; // Your backend IP
const BACKEND_PORT = 24365;

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
   * Discover backend server automatically
   */
  async discoverBackend(): Promise<string> {
    try {
      // Check if manual IP is set
      if (MANUAL_BACKEND_IP) {
        const url = `http://${MANUAL_BACKEND_IP}:${BACKEND_PORT}`;
        console.log('Using manual backend IP:', url);
        const isHealthy = await this.checkBackendHealth(url);
        if (isHealthy) {
          await this.cacheBackendUrl(url);
          this.baseUrl = url;
          return url;
        }
      }

      // Check cache first
      const cached = await this.getCachedBackendUrl();
      if (cached) {
        console.log('Using cached backend URL:', cached);
        this.baseUrl = cached;
        return cached;
      }

      // Get device IP info
      const ipAddress = await Network.getIpAddressAsync();
      console.log('Device IP:', ipAddress);

      // Extract network prefix (e.g., 192.168.1 from 192.168.1.100)
      const networkPrefix = ipAddress.substring(0, ipAddress.lastIndexOf('.'));
      console.log('Network prefix:', networkPrefix);

      // Try to find backend on the network
      const backendUrl = await this.scanNetwork(networkPrefix);
      
      if (backendUrl) {
        // Cache the discovered URL
        await this.cacheBackendUrl(backendUrl);
        this.baseUrl = backendUrl;
        return backendUrl;
      }

      throw new Error('Backend server not found on network');
    } catch (error) {
      console.error('Discovery error:', error);
      throw error;
    }
  }

  /**
   * Scan network for backend server
   */
  private async scanNetwork(networkPrefix: string): Promise<string | null> {
    const port = 24365; // Your backend port
    const commonIPs = [1, 2, 30, 100, 101, 102, 103, 104, 105]; // Common device IPs

    for (const ip of commonIPs) {
      const url = `http://${networkPrefix}.${ip}:${port}`;
      try {
        const response = await this.checkBackendHealth(url);
        if (response) {
          console.log('Backend found at:', url);
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
  private async checkBackendHealth(url: string): Promise<boolean> {
    try {
      const response = await Promise.race([
        fetch(`${url}/health`, { method: 'GET' }),
        new Promise<Response>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), DISCOVERY_TIMEOUT)
        ),
      ]) as Response;

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
   * Make API request
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const baseUrl = await this.getBaseUrl();
    const url = `${baseUrl}${endpoint}`;

    console.log('API Request:', url);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
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
  }

  /**
   * Set manual backend IP
   */
  async setManualBackendIP(ip: string): Promise<void> {
    try {
      await AsyncStorage.setItem(MANUAL_IP_KEY, ip);
      this.baseUrl = null; // Clear current connection
      console.log('Manual backend IP set to:', ip);
    } catch (error) {
      console.error('Error setting manual IP:', error);
    }
  }

  /**
   * Get manual backend IP
   */
  async getManualBackendIP(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(MANUAL_IP_KEY);
    } catch (error) {
      console.error('Error getting manual IP:', error);
      return null;
    }
  }

  /**
   * Clear manual backend IP
   */
  async clearManualBackendIP(): Promise<void> {
    try {
      await AsyncStorage.removeItem(MANUAL_IP_KEY);
      this.baseUrl = null;
      console.log('Manual backend IP cleared');
    } catch (error) {
      console.error('Error clearing manual IP:', error);
    }
  }
}

export const apiService = new APIService();
