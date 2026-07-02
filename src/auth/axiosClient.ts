import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from "axios";
import { APPARELPRO_ENDPOINTS } from "../api/api-configurations";
import type { TokenAPIModel } from "../interfaces/definitions";
import GlobalRouter from "./globalRouter";

// 1. Export standard AppError shape for TanStack React Query error generics
export interface AppError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

interface FailedRequestQueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

class AxiosInterceptor {
  public axiosInstance: AxiosInstance;
  private readonly tokenKey = "token";
  private readonly refreshTokenKey = "refreshToken";

  private isRefreshing = false;
  private failedQueue: FailedRequestQueueItem[] = [];

  constructor(instanceConfig: Record<string, any>) {
    this.axiosInstance = axios.create({
      ...instanceConfig,
      timeout: 10000,
    });

    this.initializeRequestInterceptor();
    this.initializeResponseInterceptor();
  }

  private initializeRequestInterceptor(): void {
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const accessToken = this.getAccessToken();
        if (accessToken && config.headers) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error),
    );
  }

  private initializeResponseInterceptor(): void {
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError<any>) => {
        // Changed type to <any> to read validation structures safely
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // If the error object doesn't contain a response object, parse network errors directly
        if (!error.response || !originalRequest) {
          const appNetworkError: AppError = {
            message: error.message || "Network connection failure.",
          };
          return Promise.reject(appNetworkError);
        }

        const { status, data } = error.response;

        // 1. Immediate rejection on invalid login attempts
        if (
          status === 401 &&
          (data === "Username does not exist" || data === "Invalid password")
        ) {
          return Promise.reject(error);
        }

        // 2. Token Refresh Engine (Triggers on 401 Unauthorized)
        if (status === 401 && !originalRequest._retry) {
          if (originalRequest.url === APPARELPRO_ENDPOINTS.TOKEN.REFRESH) {
            this.handleLogout();
            return Promise.reject(error);
          }

          originalRequest._retry = true;

          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({
                resolve: (token: string) => {
                  if (originalRequest.headers) {
                    originalRequest.headers["Authorization"] =
                      `Bearer ${token}`;
                  }
                  resolve(this.axiosInstance(originalRequest));
                },
                reject: (err: unknown) => reject(err),
              });
            });
          }

          this.isRefreshing = true;

          try {
            const token = this.getAccessToken();
            const refreshToken = this.getRefreshToken();

            if (!token || !refreshToken) {
              this.handleLogout();
              return Promise.reject(error);
            }

            const tokenAPIModel: TokenAPIModel = { token, refreshToken };

            const response = await this.axiosInstance.post<TokenAPIModel>(
              APPARELPRO_ENDPOINTS.TOKEN.REFRESH,
              tokenAPIModel,
            );

            const newTokens = response.data;
            this.setAccessToken(newTokens.token);
            this.setRefreshToken(newTokens.refreshToken);

            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] =
                `Bearer ${newTokens.token}`;
            }

            this.processQueue(null, newTokens.token);
            return this.axiosInstance(originalRequest);
          } catch (refreshError: any) {
            this.processQueue(refreshError, null);
            this.handleLogout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // 3. Kickout controls for expired refresh states
        if (
          status === 400 &&
          data === "Refresh token expired....Please login"
        ) {
          this.handleLogout();
        }

        // ==========================================
        // NEW FEATURE: Centralised C# Error Parsing Engine
        // ==========================================
        const appError: AppError = {
          message: "An unexpected backend error occurred.",
          status: status,
        };

        if (data) {
          // Parse complex validation dictionaries (RFC 7807)
          if (data.errors) {
            appError.errors = data.errors;
            const keys = Object.keys(data.errors);
            if (keys.length > 0) {
              const firstFieldErrors = data.errors[keys[0]];
              appError.message = Array.isArray(firstFieldErrors)
                ? firstFieldErrors[0]
                : data.title || appError.message;
            }
          }
          // Parse standard API error message parameters
          else if (typeof data === "string") {
            appError.message = data;
          } else if (data.message) {
            appError.message = data.message;
          } else if (data.title) {
            appError.message = data.title;
          }
        }

        return Promise.reject(appError);
      },
    );
  }

  private processQueue(
    error: AxiosError | Error | null,
    token: string | null = null,
  ): void {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else if (token) {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private handleLogout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    if (GlobalRouter && typeof GlobalRouter.navigate === "function") {
      GlobalRouter.navigate("/auth");
    }
  }

  public getAccessToken = (): string | null =>
    localStorage.getItem(this.tokenKey);
  public getRefreshToken = (): string | null =>
    localStorage.getItem(this.refreshTokenKey);
  public setAccessToken = (token: string): void =>
    localStorage.setItem(this.tokenKey, token);
  public setRefreshToken = (refreshToken: string): void =>
    localStorage.setItem(this.refreshTokenKey, refreshToken);
}

export const client = new AxiosInterceptor({
  baseURL: APPARELPRO_ENDPOINTS.URLS.BASEURL,
}).axiosInstance;
