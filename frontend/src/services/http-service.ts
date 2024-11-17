const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface RequestParams {
  headers?: { [key: string]: string };
  query?: { [key: string]: string };
  body?: object;
}

export class HttpService {
  private static accessToken: string | null = null;
  private static refreshToken: string | null = null;

  static async get<T>(url: string, params?: RequestParams, authRequired = true, isLoginAttempt = false): Promise<T> {
    return await HttpService.request<T>(url, 'GET', params, authRequired, isLoginAttempt);
  }

  static async post<T>(url: string, body: object, params?: RequestParams, authRequired = true, isLoginAttempt = false): Promise<T> {
      return await HttpService.request<T>(url, 'POST', { ...params, body }, authRequired, isLoginAttempt);
  }

  static async put<T>(url: string, body: object, params?: RequestParams, authRequired = true, isLoginAttempt = false): Promise<T> {
      return await HttpService.request<T>(url, 'PUT', { ...params, body }, authRequired, isLoginAttempt);
  }

  static async patch<T>(url: string, body: object, params?: RequestParams, authRequired = true, isLoginAttempt = false): Promise<T> {
      return await HttpService.request<T>(url, 'PATCH', { ...params, body }, authRequired, isLoginAttempt);
  }

  static async delete<T>(url: string, params?: RequestParams, authRequired = true, isLoginAttempt = false): Promise<T> {
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
      const requestUrl = new URL(url, API_BASE_URL);
  
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
  

  public static setAccessToken(accessToken: string): void {
    console.log("[HTTP Service] Setting access token..");
    this.accessToken = accessToken;
    localStorage.setItem('accessToken', accessToken);
    console.log("HTTP Service] AccessToken from here: ", this.accessToken);
    console.log("HTTP Service] AccessToken from local storage: ", localStorage.getItem('accessToken'));
  }

  public static setRefreshToken(refreshToken: string): void {
    console.log("[HTTP Service] Setting refresh token..");
    this.refreshToken = refreshToken;
    localStorage.setItem('refreshToken', refreshToken);
    console.log("HTTP Service] RefreshToken from here: ", this.refreshToken);
    console.log("HTTP Service] RefreshToken from local storage: ", localStorage.getItem('refreshToken'));
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
