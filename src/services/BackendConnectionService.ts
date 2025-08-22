import API_CONFIG, { PAYSTACK_CONFIG } from '../config/api';

interface ConnectionStatus {
  backend: boolean;
  paystack: boolean;
  appwrite: boolean;
}

interface BackendHealth {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    database: boolean;
    paystack: boolean;
    redis?: boolean;
  };
  version?: string;
}

class BackendConnectionService {
  private static instance: BackendConnectionService;
  private connectionStatus: ConnectionStatus = {
    backend: false,
    paystack: false,
    appwrite: false,
  };

  public static getInstance(): BackendConnectionService {
    if (!BackendConnectionService.instance) {
      BackendConnectionService.instance = new BackendConnectionService();
    }
    return BackendConnectionService.instance;
  }

  /**
   * Test connection to your backend server
   */
  public async testBackendConnection(): Promise<{ connected: boolean; health?: BackendHealth; error?: string }> {
    try {
      console.log('🔗 Testing backend connection to:', API_CONFIG.baseURL);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
      
      const response = await fetch(API_CONFIG.healthURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Backend health check failed: ${response.status}`);
      }

      const health: BackendHealth = await response.json();
      this.connectionStatus.backend = true;
      
      console.log('✅ Backend connection successful:', health);
      return { connected: true, health };
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      this.connectionStatus.backend = false;
      return { connected: false, error: error.message };
    }
  }

  /**
   * Test Paystack API connection through your backend
   */
  public async testPaystackConnection(): Promise<{ connected: boolean; error?: string }> {
    try {
      console.log('💳 Testing Paystack connection...');
      
      // Test through your backend's Paystack proxy
      const response = await fetch(`${API_CONFIG.baseURL}/paystack/banks?perPage=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Paystack test failed: ${response.status}`);
      }

      await response.json(); // Validate response is valid JSON
      this.connectionStatus.paystack = true;
      
      console.log('✅ Paystack connection successful');
      return { connected: true };
    } catch (error) {
      console.error('❌ Paystack connection failed:', error);
      this.connectionStatus.paystack = false;
      return { connected: false, error: error.message };
    }
  }

  /**
   * Test Appwrite connection
   */
  public async testAppwriteConnection(): Promise<{ connected: boolean; error?: string }> {
    try {
      console.log('📦 Testing Appwrite connection...');
      
      // Test your backend's Appwrite connection
      const response = await fetch(`${API_CONFIG.baseURL}/appwrite/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Appwrite test failed: ${response.status}`);
      }

      this.connectionStatus.appwrite = true;
      console.log('✅ Appwrite connection successful');
      return { connected: true };
    } catch (error) {
      console.error('❌ Appwrite connection failed:', error);
      this.connectionStatus.appwrite = false;
      return { connected: false, error: error.message };
    }
  }

  /**
   * Test all connections and return comprehensive status
   */
  public async testAllConnections(): Promise<{
    success: boolean;
    connections: ConnectionStatus;
    details: {
      backend?: { connected: boolean; health?: BackendHealth; error?: string };
      paystack?: { connected: boolean; error?: string };
      appwrite?: { connected: boolean; error?: string };
    };
  }> {
    console.log('🚀 Testing all backend connections...');
    
    const results = await Promise.allSettled([
      this.testBackendConnection(),
      this.testPaystackConnection(),
      this.testAppwriteConnection(),
    ]);

    const backendResult = results[0].status === 'fulfilled' ? results[0].value : { connected: false, error: 'Connection failed' };
    const paystackResult = results[1].status === 'fulfilled' ? results[1].value : { connected: false, error: 'Connection failed' };
    const appwriteResult = results[2].status === 'fulfilled' ? results[2].value : { connected: false, error: 'Connection failed' };

    const allConnected = backendResult.connected && paystackResult.connected && appwriteResult.connected;

    const summary = {
      success: allConnected,
      connections: this.connectionStatus,
      details: {
        backend: backendResult,
        paystack: paystackResult,
        appwrite: appwriteResult,
      },
    };

    if (allConnected) {
      console.log('🎉 All connections successful! Your app is ready for production.');
    } else {
      console.log('⚠️ Some connections failed. Check the details above.');
    }

    return summary;
  }

  /**
   * Get current connection status
   */
  public getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Check if app is ready for production
   */
  public isProductionReady(): boolean {
    const { backend, paystack, appwrite } = this.connectionStatus;
    const hasPaystackKey = !!PAYSTACK_CONFIG.publicKey && !PAYSTACK_CONFIG.publicKey.includes('your_');
    const isProduction = API_CONFIG.isProduction;
    
    return backend && paystack && appwrite && hasPaystackKey && isProduction;
  }

  /**
   * Get production readiness report
   */
  public getProductionReadinessReport(): {
    ready: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check backend connection
    if (!this.connectionStatus.backend) {
      issues.push('Backend server is not reachable');
      recommendations.push('Ensure your backend server is running and accessible');
    }

    // Check Paystack configuration
    if (!PAYSTACK_CONFIG.publicKey || PAYSTACK_CONFIG.publicKey.includes('your_')) {
      issues.push('Paystack public key is not configured');
      recommendations.push('Add your live Paystack public key to .env file');
    }

    // Check environment
    if (!API_CONFIG.isProduction) {
      issues.push('App is not in production mode');
      recommendations.push('Set EXPO_PUBLIC_APP_ENV=production in .env file');
    }

    // Check Paystack connection
    if (!this.connectionStatus.paystack) {
      issues.push('Paystack API is not accessible');
      recommendations.push('Check your Paystack credentials and network connection');
    }

    // Check Appwrite connection
    if (!this.connectionStatus.appwrite) {
      issues.push('Appwrite database is not accessible');
      recommendations.push('Verify your Appwrite configuration and credentials');
    }

    return {
      ready: issues.length === 0,
      issues,
      recommendations,
    };
  }
}

export default BackendConnectionService;
