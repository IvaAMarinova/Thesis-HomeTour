const API_BASE_URL = 'http://localhost:3000';

export interface RequestParams {
  headers?: { [key: string]: string };
  query?: { [key: string]: string };
  body?: object;
}

export class HttpService {
  private static accessToken: string | null = null;
  private static refreshToken: string | null = null;

  static async get<T>(url: string, params?: RequestParams): Promise<T> {
    return await HttpService.request<T>(url, 'GET', params);
  }

  static async post<T>(url: string, body: object, params?: RequestParams): Promise<T> {
    return await HttpService.request<T>(url, 'POST', { ...params, body });
  }

  static async put<T>(url: string, body: object, params?: RequestParams): Promise<T> {
    return await HttpService.request<T>(url, 'PUT', { ...params, body });
  }

  static async patch<T>(url: string, body: object, params?: RequestParams): Promise<T> {
    return await HttpService.request<T>(url, 'PATCH', { ...params, body });
  }

  static async delete<T>(url: string, params?: RequestParams): Promise<T> {
    return await HttpService.request<T>(url, 'DELETE', params);
  }

  private static async request<T>(url: string, method: string, params?: RequestParams): Promise<T> {
    try {
      const requestUrl = new URL(url, API_BASE_URL);
      if (params?.query) {
        Object.keys(params.query).forEach((key) =>
          requestUrl.searchParams.append(key, params.query![key]),
        );
      }

      const headers = {
        ...(params?.body instanceof FormData
          ? {}
          : { 'Content-Type': 'application/json' }),
        ...params?.headers,
        ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
      };

      const response = await fetch(requestUrl.toString(), {
        method: method,
        headers: headers,
        body:
          params?.body instanceof FormData
            ? (params.body as BodyInit)
            : params?.body
            ? JSON.stringify(params.body)
            : undefined,
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('[HttpService] Token expired. Attempting to refresh...');
          await this.refreshAccessToken();
          return await this.request<T>(url, method, params);
        } else {
          throw new Error(`Request failed with status ${response.status}`);
        }
      }

      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        const textData = await response.text();
        return textData as unknown as T;
      }
    } catch (error) {
      console.error('Error making request:', error);
      throw error;
    }
  }

  public static setAccessToken(accessToken: string): void {
    this.accessToken = accessToken;
    localStorage.setItem('accessToken', accessToken);
  }

  public static setRefreshToken(refreshToken: string): void {
    this.refreshToken = refreshToken;
    localStorage.setItem('refreshToken', refreshToken);
  }

  public static logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  public static isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  private static async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    console.log('[HttpService] Refreshing access token');
    console.log('[HttpService] Refresh token:', this.refreshToken);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      this.setAccessToken(data.access_token);
      console.log('Access token refreshed');
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      this.logout();
      throw new Error('Session expired. Please log in again');
    }
  }
}
