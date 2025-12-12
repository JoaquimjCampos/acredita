import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

/**
 * API Response Wrapper
 */
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

/**
 * Paginated Response Format (Django REST Framework)
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Error Response Format
 */
export interface ErrorResponse {
  detail?: string;
  [key: string]: any;
}

/**
 * Request Config with custom options
 */
interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipErrorHandler?: boolean;
}

/**
 * ApiClient - Centralizado gerenciador de requisições para backend
 * Responsável por:
 * - Autenticação JWT (token + refresh)
 * - Interceptação de requests/responses
 * - Error handling padronizado
 * - Retry logic
 */
export class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(
    baseURL: string = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v2'
  ) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30s timeout
    });

    this.setupInterceptors();
  }

  /**
   * Setup Request & Response Interceptors
   */
  private setupInterceptors(): void {
    // Request Interceptor: Add JWT token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: Handle 401 & token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as RequestConfig;

        // Se 401 e não é retry, tentar refresh token
        if (error.response?.status === 401 && !(originalRequest as any)._retry) {
          if (this.isRefreshing) {
            // Se já está refreshing, esperar na fila
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (!originalRequest.headers) originalRequest.headers = {};
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.client(originalRequest));
              });
            });
          }

          (originalRequest as any)._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            this.isRefreshing = false;
            this.onRefreshed(newToken);
            if (!originalRequest.headers) originalRequest.headers = {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.isRefreshing = false;
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Notify all waiting subscribers about new token
   */
  private onRefreshed(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  /**
   * Get access token from localStorage
   */
  private getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Get refresh token from localStorage
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Clear both tokens
   */
  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      // Fazer request sem interceptor para evitar loop infinito
      const response = await axios.post(
        `${this.baseURL}/../auth/token/refresh/`,
        { refresh: refreshToken }
      );
      const newAccessToken = response.data.access;
      localStorage.setItem('access_token', newAccessToken);
      return newAccessToken;
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }

  /**
   * Generic GET request
   */
  async get<T = any>(
    url: string,
    config?: RequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error, config);
      throw error;
    }
  }

  /**
   * Generic POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error, config);
      throw error;
    }
  }

  /**
   * Generic PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error, config);
      throw error;
    }
  }

  /**
   * Generic PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error, config);
      throw error;
    }
  }

  /**
   * Generic DELETE request
   */
  async delete<T = any>(
    url: string,
    config?: RequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error, config);
      throw error;
    }
  }

  /**
   * Centralized Error Handler
   */
  private handleError(error: any, config?: RequestConfig): void {
    if (config?.skipErrorHandler) return;

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data as ErrorResponse;

      console.error(`[API Error ${status}]`, {
        url: error.config?.url,
        method: error.config?.method,
        status,
        message: data?.detail || error.message,
      });

      // Dispatch custom event for global error handling
      window.dispatchEvent(
        new CustomEvent('apiError', {
          detail: {
            status,
            message: data?.detail || error.message,
            data,
          },
        })
      );
    }
  }

  /**
   * Set tokens after login
   */
  setTokens(accessToken: string, refreshToken: string, userInfo?: any): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    if (userInfo) {
      localStorage.setItem('user_info', JSON.stringify(userInfo));
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Get current user info from localStorage
   */
  getCurrentUser(): any {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  }

  /**
   * Logout
   */
  logout(): void {
    this.clearTokens();
  }
}

/**
 * Singleton instance
 */
export const apiClient = new ApiClient();

export default apiClient;
