// API Error handling utilities

export interface ApiError {
  success: false;
  message: string;
  status?: number;
  code?: string;
}

export class PaystackApiError extends Error {
  public status?: number;
  public code?: string;
  public success = false;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'PaystackApiError';
    this.status = status;
    this.code = code;
  }
}

export const handleApiError = (error: any): string => {
  console.error('API Error:', error);

  if (error instanceof PaystackApiError) {
    return error.message;
  }

  if (error.status) {
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication failed. Please check your credentials.';
      case 403:
        return 'Access denied. You don\'t have permission for this action.';
      case 404:
        return 'Resource not found.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return `Request failed with status ${error.status}.`;
    }
  }

  if (error.message) {
    // Network errors
    if (error.message.includes('Network request failed')) {
      return 'Network error. Please check your internet connection.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

export const isNetworkError = (error: any): boolean => {
  return (
    error.message?.includes('Network request failed') ||
    error.message?.includes('timeout') ||
    error.code === 'NETWORK_ERROR'
  );
};

export const isRateLimitError = (error: any): boolean => {
  return error.status === 429;
};

export const isServerError = (error: any): boolean => {
  return error.status >= 500;
};

// Retry utility with exponential backoff
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (400-499) except 429 (rate limit)
      if (error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error;
      }

      // Don't retry on the last attempt
      if (i === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, i);
      console.log(`Request failed, retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};
