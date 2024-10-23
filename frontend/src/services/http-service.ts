const API_BASE_URL = 'http://localhost:3000';

export interface RequestParams {
  headers?: { [key: string]: string };
  query?: { [key: string]: string };
  body?: object;
}

export class HttpService {
  private static accessToken: string | null = null;

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
        throw new Error(`Request failed with status ${response.status}`);
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
  }

  public static logout(): void {
    this.accessToken = null;
  }

  public static isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}