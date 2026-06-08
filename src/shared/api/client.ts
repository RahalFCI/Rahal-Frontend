/**
 * API Client — Fetch wrapper using axios (Decision: axios chosen for built-in
 * interceptor support, request/response transforms, and familiar API).
 *
 * Unwraps ApiResponse<T> at this boundary (claude.md §2.3 rule 1):
 * - Returns data on success
 * - Throws typed ApiError on failure
 *
 * Base URL sourced from expo-constants env config.
 */
import axios, { isAxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { env } from '../../config/env';
import { ApiError, ApiValidationError, resolveErrorCode } from './errors';
import { setupRefreshInterceptor } from './refreshInterceptor';

/**
 * Shape of the backend's standard response envelope.
 * Backend: ApiResponse<T>(Data, IsSuccess, ErrorCode) — C# record,
 * serialized to camelCase JSON by System.Text.Json.
 * Note: errorCode is the enum member name (string) by default in .NET, e.g. "InvalidCredentials".
 */
interface ApiResponse<T> {
  isSuccess: boolean;
  data?: T;
  errorCode?: number | string;
}

/**
 * Shape of the backend's validation error response.
 * Returned by ValidationActionFilter at HTTP 400, NOT wrapped in ApiResponse.
 */
interface ValidationErrorResponse {
  errors?: { property: string; message: string }[];
}

const instance: AxiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

// Wire refresh interceptor
setupRefreshInterceptor(instance);

/**
 * Unwrapping request helper. Strips the ApiResponse envelope.
 */
export async function apiClient<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await instance.request<ApiResponse<T>>(config);
    const body = response.data;

    if (body.isSuccess && body.data !== undefined) {
      return body.data;
    }

    throw new ApiError(
      resolveErrorCode(response.status, body.errorCode),
      'Request failed',
      response.status,
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const body = error.response?.data as
        | (ApiResponse<unknown> & ValidationErrorResponse)
        | undefined;

      if (!error.response) {
        throw new ApiError('NETWORK', error.message, 0);
      }

      // Detect validation error shape from ValidationActionFilter
      if (body?.errors && Array.isArray(body.errors)) {
        throw new ApiValidationError(body.errors);
      }

      throw new ApiError(resolveErrorCode(status, body?.errorCode), error.message, status);
    }

    throw new ApiError('NETWORK', 'Network request failed', 0);
  }
}

/**
 * Request helper for endpoints that return 204 No Content (e.g., logout).
 * Does not attempt to parse a response body.
 */
export async function apiClientNoContent(config: AxiosRequestConfig): Promise<void> {
  try {
    await instance.request(config);
  } catch (error) {
    if (isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const body = error.response?.data as ApiResponse<unknown> | undefined;
      if (!error.response) {
        throw new ApiError('NETWORK', error.message, 0);
      }
      throw new ApiError(resolveErrorCode(status, body?.errorCode), error.message, status);
    }
    throw new ApiError('NETWORK', 'Network request failed', 0);
  }
}

/** Expose the raw instance for interceptor setup */
export { instance as axiosInstance };
