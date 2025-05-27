import { Cookies } from "react-cookie";
const cookies = new Cookies();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface RequestParams {
  headers?: { [key: string]: string };
  query?: { [key: string]: string };
  body?: object;
}

export class HttpService {
  private static accessToken: string | null;
  private static refreshToken: string | null;

  static loadTokensFromCookies() {
    this.accessToken = cookies.get("accessToken") || null;
    this.refreshToken = cookies.get("refreshToken") || null;
  }

  static setAccessToken(token: string) {
    this.accessToken = token;
  }

  static setRefreshToken(token: string) {
    this.refreshToken = token;
  }

  static async get<T>(
    url: string,
    params?: RequestParams,
    authRequired = false,
    isLoginAttempt = false
  ): Promise<T> {
    return await HttpService.request<T>(
      url,
      "GET",
      params,
      authRequired,
      isLoginAttempt
    );
  }

  static async post<T>(
    url: string,
    body: object,
    params?: RequestParams,
    authRequired = false,
    isLoginAttempt = false
  ): Promise<T> {
    return await HttpService.request<T>(
      url,
      "POST",
      { ...params, body },
      authRequired,
      isLoginAttempt
    );
  }

  static async put<T>(
    url: string,
    body: object,
    params?: RequestParams,
    authRequired = false,
    isLoginAttempt = false
  ): Promise<T> {
    return await HttpService.request<T>(
      url,
      "PUT",
      { ...params, body },
      authRequired,
      isLoginAttempt
    );
  }

  static async patch<T>(
    url: string,
    body: object,
    params?: RequestParams,
    authRequired = false,
    isLoginAttempt = false
  ): Promise<T> {
    return await HttpService.request<T>(
      url,
      "PATCH",
      { ...params, body },
      authRequired,
      isLoginAttempt
    );
  }

  static async delete<T>(
    url: string,
    params?: RequestParams,
    authRequired = false,
    isLoginAttempt = false
  ): Promise<T> {
    return await HttpService.request<T>(
      url,
      "DELETE",
      params,
      authRequired,
      isLoginAttempt
    );
  }

  static async request<T>(
    url: string,
    method: string,
    params?: RequestParams,
    authRequired = true,
    isLoginAttempt = false
  ): Promise<T> {
    try {
      if (!this.accessToken && !isLoginAttempt) {
        this.loadTokensFromCookies();
      }

      const apiBase = API_BASE_URL.endsWith("/")
        ? API_BASE_URL.slice(0, -1)
        : API_BASE_URL;
      const requestPath = url.startsWith("/") ? url : `/${url}`;
      const requestUrl = new URL(`${apiBase}${requestPath}`);
      if (params?.query) {
        Object.keys(params.query).forEach((key) =>
          requestUrl.searchParams.append(key, params.query![key])
        );
      }

      const headers = {
        ...(params?.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...params?.headers,
        ...(this.accessToken && authRequired
          ? { Authorization: `Bearer ${this.accessToken}` }
          : {}),
      };

      const response = await fetch(requestUrl.toString(), {
        method,
        headers,
        credentials: authRequired ? "include" : "omit",
        body:
          params?.body instanceof FormData
            ? (params.body as BodyInit)
            : params?.body
            ? JSON.stringify(params.body)
            : undefined,
      });

      if (!response.ok) {
        if (response.status === 401 && authRequired && !isLoginAttempt) {
          try {
            await this.refreshAccessToken();
            return await this.request<T>(url, method, params, authRequired);
          } catch (refreshError) {
            throw refreshError;
          }
        } else if (response.status === 401 && isLoginAttempt) {
          throw new Error("Invalid login credentials");
        } else {
          const errorData = await response.json().catch(() => null);
          const errorMessage =
            errorData?.message ||
            `Request failed with status ${response.status}`;
          throw new Error(errorMessage);
        }
      }

      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        const textData = await response.text();
        return textData as unknown as T;
      }
    } catch (error) {
      console.error("Error making request:", error);
      throw error;
    }
  }

  public static async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("[HttpService] Error during logout:", error);
    }
  }

  public static async isAuthenticated(
    fetchUserId: () => Promise<void>
  ): Promise<boolean> {
    if (!this.accessToken && !this.refreshToken) {
      this.loadTokensFromCookies();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 401) {
          try {
            await this.refreshAccessToken();
            return await this.isAuthenticated(fetchUserId);
          } catch (error) {
            return false;
          }
        } else {
          return false;
        }
      }

      await fetchUserId();
      return true;
    } catch (error) {
      return false;
    }
  }

  private static async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      this.loadTokensFromCookies();
    }

    if (!this.refreshToken) {
      this.logout();
      throw new Error("No refresh token available");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken,
          accessToken: this.accessToken,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        this.logout();
        throw new Error("Failed to refresh access token");
      }

      const data = await response.json();
      cookies.set("accessToken", data.accessToken, {
        path: "/",
        httpOnly: false,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      cookies.set("refreshToken", data.refreshToken, {
        path: "/",
        httpOnly: false,
        maxAge: 30 * 24 * 60 * 60,
      });

      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
    } catch (error) {
      this.logout();
      throw new Error("Session expired. Please log in again");
    }
  }
}
