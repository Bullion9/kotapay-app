import API_CONFIG, { APPWRITE_CONFIG, PAYSTACK_CONFIG, DEBUG_CONFIG } from '../config/api';

interface ConnectionTest {
  service: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  latency?: number;
}

class ConnectionTester {
  private async testEndpoint(url: string, timeout: number = 5000): Promise<{ success: boolean; latency: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;
      
      return {
        success: response.ok,
        latency,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        success: false,
        latency,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async testBackendConnection(): Promise<ConnectionTest> {
    if (DEBUG_CONFIG.api) {
      console.log('🔍 Testing backend connection:', API_CONFIG.healthURL);
    }

    const result = await this.testEndpoint(API_CONFIG.healthURL);
    
    return {
      service: 'Backend API',
      status: result.success ? 'success' : 'error',
      message: result.success 
        ? `Connected successfully (${result.latency}ms)`
        : `Failed to connect: ${result.error}`,
      latency: result.latency
    };
  }

  async testAppwriteConnection(): Promise<ConnectionTest> {
    const healthUrl = `${APPWRITE_CONFIG.endpoint}/health`;
    
    if (DEBUG_CONFIG.appwrite) {
      console.log('🔍 Testing Appwrite connection:', healthUrl);
    }

    const result = await this.testEndpoint(healthUrl);
    
    return {
      service: 'Appwrite Database',
      status: result.success ? 'success' : 'error',
      message: result.success 
        ? `Connected successfully (${result.latency}ms)`
        : `Failed to connect: ${result.error}`,
      latency: result.latency
    };
  }

  async testPaystackConnection(): Promise<ConnectionTest> {
    const healthUrl = `${PAYSTACK_CONFIG.apiUrl}/`;
    
    const result = await this.testEndpoint(healthUrl);
    
    return {
      service: 'Paystack API',
      status: result.success ? 'success' : 'error',
      message: result.success 
        ? `Connected successfully (${result.latency}ms)`
        : `Failed to connect: ${result.error}`,
      latency: result.latency
    };
  }

  async testAllConnections(): Promise<ConnectionTest[]> {
    console.log('🚀 Testing all KotaPay connections...\n');

    const tests = await Promise.all([
      this.testBackendConnection(),
      this.testAppwriteConnection(),
      this.testPaystackConnection(),
    ]);

    // Log results
    console.log('📊 Connection Test Results:');
    console.log('============================');
    
    tests.forEach(test => {
      const emoji = test.status === 'success' ? '✅' : '❌';
      console.log(`${emoji} ${test.service}: ${test.message}`);
    });

    const successCount = tests.filter(t => t.status === 'success').length;
    console.log(`\n📈 Summary: ${successCount}/${tests.length} services connected`);

    return tests;
  }

  getConnectionStatus(): {
    backend: string;
    appwrite: string;
    paystack: string;
    environment: string;
  } {
    return {
      backend: API_CONFIG.baseURL,
      appwrite: `${APPWRITE_CONFIG.endpoint} (Project: ${APPWRITE_CONFIG.projectId})`,
      paystack: PAYSTACK_CONFIG.apiUrl,
      environment: API_CONFIG.environment
    };
  }

  validateConfiguration(): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check Appwrite config
    if (!APPWRITE_CONFIG.projectId || APPWRITE_CONFIG.projectId === '') {
      issues.push('Appwrite Project ID is missing');
    }

    if (!APPWRITE_CONFIG.databaseId || APPWRITE_CONFIG.databaseId === '') {
      issues.push('Appwrite Database ID is missing');
    }

    // Check Paystack config
    if (!PAYSTACK_CONFIG.publicKey || PAYSTACK_CONFIG.publicKey === '') {
      issues.push('Paystack Public Key is missing');
    }

    // Check API config
    if (!API_CONFIG.baseURL || API_CONFIG.baseURL === '') {
      issues.push('Backend API URL is missing');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

export const connectionTester = new ConnectionTester();
export default ConnectionTester;
