import { Cookies } from 'react-cookie';
const cookies = new Cookies();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface RequestParams {
  headers?: { [key: string]: string };
  query?: { [key: string]: string };
  body?: object;
}

export class HttpService {
  private static accessToken: string | null = null;
  private static refreshToken: string | null = null;

  static setTokenCookies(accessToken: string, refreshToken: string) {
    cookies.set('accessToken', accessToken, {
      path: '/',
      secure: false,
      sameSite: 'strict',
      maxAge: 3600
    });
    cookies.set('refreshToken', refreshToken, {
      path: '/',
      secure: false,
      sameSite: 'strict',
      maxAge: 3600
    });
  }

  private static loadTokensFromCookies() {
    this.accessToken = cookies.get('accessToken') || null;
    this.refreshToken = cookies.get('refreshToken') || null;
  }

  static async get<T>(url: string, params?: RequestParams, authRequired = false, isLoginAttempt = false): Promise<T> {
    return await HttpService.request<T>(url, 'GET', params, authRequired, isLoginAttempt);
  }

  static async post<T>(url: string, body: object, params?: RequestParams, authRequired = false, isLoginAttempt = false): Promise<T> {
      return await HttpService.request<T>(url, 'POST', { ...params, body }, authRequired, isLoginAttempt);
  }

  static async put<T>(url: string, body: object, params?: RequestParams, authRequired = false, isLoginAttempt = false): Promise<T> {
      return await HttpService.request<T>(url, 'PUT', { ...params, body }, authRequired, isLoginAttempt);
  }

  static async patch<T>(url: string, body: object, params?: RequestParams, authRequired = false, isLoginAttempt = false): Promise<T> {
      return await HttpService.request<T>(url, 'PATCH', { ...params, body }, authRequired, isLoginAttempt);
  }

  static async delete<T>(url: string, params?: RequestParams, authRequired = false, isLoginAttempt = false): Promise<T> {
      return await HttpService.request<T>(url, 'DELETE', params, authRequired, isLoginAttempt);
  }


  static async request<T>(
    url: string,
    method: string,
    params?: RequestParams,
    authRequired = true,
    isLoginAttempt = false
  ): Promise<T> {
    try {

      this.loadTokensFromCookies();
      
      const requestUrl = new URL(url, API_BASE_URL);
      console.log('[HttpService] Access token from cookies:', this.accessToken);
      console.log('[HttpService] Refresh token from cookies:', this.refreshToken);
      console.log('[HttpService] Request URL:', requestUrl.toString());

  
      if (params?.query) {
        Object.keys(params.query).forEach((key) =>
          requestUrl.searchParams.append(key, params.query![key]),
        );
      }
  
      const headers = {
        ...(params?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...params?.headers,
        ...(this.accessToken && authRequired ? { Authorization: `Bearer ${this.accessToken}` } : {}),
      };

      console.log("[Http Service] Credentials: ", authRequired? 'include': 'omit');
  
      const response = await fetch(requestUrl.toString(), {
        method,
        headers,
        credentials: authRequired? 'include': 'omit',
        body:
          params?.body instanceof FormData
            ? (params.body as BodyInit)
            : params?.body
            ? JSON.stringify(params.body)
            : undefined,
      });
  
      if (!response.ok) {
        if (response.status === 401 && authRequired && !isLoginAttempt) {
          console.log('[HttpService] Token expired. Attempting to refresh...');
          await this.refreshAccessToken();
          return await this.request<T>(url, method, params, authRequired);
        } else if (response.status === 401 && isLoginAttempt) {
          throw new Error('Invalid login credentials');
        } else {
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.message || `Request failed with status ${response.status}`;
          const error = new Error(errorMessage);
          (error as any).response = errorData;
          throw error;
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

  public static async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
  
      console.log('[HttpService] Logout successful. Cookies cleared.');
    } catch (error) {
      console.error('[HttpService] Error during logout:', error);
    }
  }

  public static isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  private static async refreshAccessToken(): Promise<void> {
    this.loadTokensFromCookies();
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
        body: JSON.stringify({ refreshToken: this.refreshToken, accessToken: this.accessToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      this.setTokenCookies(data.accessToken, data.refreshToken);
      console.log('Access token refreshed');
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      this.logout();
      throw new Error('Session expired. Please log in again');
    }
  }
}
