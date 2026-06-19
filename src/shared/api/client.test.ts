/* eslint-disable import/first */
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../config/env', () => ({
  env: {
    API_BASE_URL: 'http://api.test/api',
    MEDIA_BASE_URL: 'http://api.test',
    DEV_BYPASS_AUTH: false,
  },
}));

import {
  apiClient,
  apiClientNoContent,
  axiosInstance,
  publicApiClient,
  publicAxiosInstance,
} from './client';
import { ApiError, ApiValidationError } from './errors';

describe('apiClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('unwraps successful ApiResponse envelopes', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      status: 200,
      data: { isSuccess: true, data: { id: 'explorer-1' }, errorCode: 'None' },
    });

    await expect(
      apiClient<{ id: string }>({ method: 'GET', url: '/ExplorerProfile/explorer-1' }),
    ).resolves.toEqual({ id: 'explorer-1' });
  });

  it('throws mapped ApiError for failure envelopes', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({
      status: 403,
      data: { isSuccess: false, errorCode: 'ProfileSetupRequired' },
    });

    await expect(apiClient({ method: 'GET', url: '/ExplorerProfile/me' })).rejects.toMatchObject({
      code: 'PROFILE_SETUP_REQUIRED',
      status: 403,
    } satisfies Partial<ApiError>);
  });

  it('throws ApiValidationError for backend validation response shape', async () => {
    vi.spyOn(axiosInstance, 'request').mockRejectedValue({
      isAxiosError: true,
      message: 'Request failed with status code 400',
      response: {
        status: 400,
        data: { errors: [{ property: 'Password', message: 'Password is required' }] },
      },
    });

    await expect(apiClient({ method: 'POST', url: '/User/register' })).rejects.toBeInstanceOf(
      ApiValidationError,
    );
  });
});

describe('apiClientNoContent', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not require a response body for 204 endpoints', async () => {
    vi.spyOn(axiosInstance, 'request').mockResolvedValue({ status: 204, data: undefined });

    await expect(
      apiClientNoContent({ method: 'POST', url: '/User/logout' }),
    ).resolves.toBeUndefined();
  });
});

describe('publicApiClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('unwraps public ApiResponse envelopes through the no-auth instance', async () => {
    const request = vi.spyOn(publicAxiosInstance, 'request').mockResolvedValue({
      status: 200,
      data: { isSuccess: true, data: [{ id: 'place-1' }], errorCode: 'None' },
    });

    await expect(publicApiClient({ method: 'GET', url: '/Place' })).resolves.toEqual([
      { id: 'place-1' },
    ]);
    expect(request.mock.calls[0][0].headers?.Authorization).toBeUndefined();
  });
});
