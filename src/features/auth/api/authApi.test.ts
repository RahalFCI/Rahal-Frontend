/* eslint-disable import/first */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { apiClientMock, apiClientNoContentMock } = vi.hoisted(() => ({
  apiClientMock: vi.fn(),
  apiClientNoContentMock: vi.fn(),
}));

vi.mock('../../../shared/api/client', () => ({
  apiClient: apiClientMock,
  apiClientNoContent: apiClientNoContentMock,
}));

vi.mock('../../../config/env', () => ({
  env: {
    API_BASE_URL: 'http://api.test/api',
    MEDIA_BASE_URL: 'http://api.test',
    DEV_BYPASS_AUTH: false,
  },
}));

vi.mock('../store/authStore', () => ({
  useAuthStore: {
    getState: () => ({ accessToken: 'access-token' }),
  },
}));

import {
  getExplorerProfile,
  login,
  logout,
  refreshTokens,
  register,
  updatePassword,
} from './authApi';
import { authEndpoints } from './endpoints';

describe('auth API endpoint alignment', () => {
  beforeEach(() => {
    apiClientMock.mockReset();
    apiClientNoContentMock.mockReset();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses UserController for email/password login', async () => {
    apiClientMock.mockResolvedValueOnce({ accessToken: 'a', refreshToken: 'r' });

    await login({ email: 'e@example.com', password: 'Password1!' });

    expect(apiClientMock).toHaveBeenCalledWith({
      method: 'POST',
      url: authEndpoints.user.login,
      data: { email: 'e@example.com', password: 'Password1!' },
    });
  });

  it('registers an Explorer with the backend multipart profile shape', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          isSuccess: true,
          data: 'User registered successfully',
        }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await register({
      name: 'Explorer One',
      email: 'e@example.com',
      password: 'Password1!',
      confirmPassword: 'Password1!',
      phoneNumber: '+201001234567',
      birthDate: '2000-01-01',
      gender: 1,
      bio: 'Cataloging places',
      countryCode: 'EG',
      isPublic: true,
    });

    expect(fetchMock).toHaveBeenCalledWith('http://api.test/api/User/register', {
      method: 'POST',
      body: expect.any(FormData),
    });
    const formData = fetchMock.mock.calls[0][1].body as FormData;
    expect(formData.get('Name')).toBe('Explorer One');
    expect(formData.get('Email')).toBe('e@example.com');
    expect(formData.get('Password')).toBe('Password1!');
    expect(formData.get('ConfirmPassword')).toBe('Password1!');
    expect(formData.get('PhoneNumber')).toBe('+201001234567');
    expect(formData.get('BirthDate')).toBe('2000-01-01');
    expect(formData.get('Gender')).toBe('1');
    expect(formData.get('Bio')).toBe('Cataloging places');
    expect(formData.get('CountryCode')).toBe('EG');
    expect(formData.get('IsPublic')).toBe('true');
  });

  it('uses AuthController for token refresh', async () => {
    apiClientMock.mockResolvedValueOnce({ accessToken: 'new-a', refreshToken: 'new-r' });

    await refreshTokens({ accessToken: 'old-a', refreshToken: 'old-r' });

    expect(apiClientMock).toHaveBeenCalledWith({
      method: 'POST',
      url: authEndpoints.auth.refresh,
      data: { accessToken: 'old-a', refreshToken: 'old-r' },
    });
  });

  it('uses UserController for logout and password updates', async () => {
    apiClientNoContentMock.mockResolvedValueOnce(undefined);
    apiClientMock.mockResolvedValueOnce('Password updated');

    await logout();
    await updatePassword('user-1', {
      oldPassword: 'Password1!',
      newPassword: 'Password2!',
      confirmPassword: 'Password2!',
    });

    expect(apiClientNoContentMock).toHaveBeenCalledWith({
      method: 'POST',
      url: authEndpoints.user.logout,
    });
    expect(apiClientMock).toHaveBeenCalledWith({
      method: 'PUT',
      url: authEndpoints.user.updatePassword('user-1'),
      data: {
        oldPassword: 'Password1!',
        newPassword: 'Password2!',
        confirmPassword: 'Password2!',
      },
    });
  });
});

describe('getExplorerProfile', () => {
  beforeEach(() => {
    apiClientMock.mockReset();
    apiClientNoContentMock.mockReset();
  });

  it('normalizes ExplorerProfile and UserStats backend DTOs for existing screens', async () => {
    apiClientMock.mockImplementation(({ url }) => {
      if (url === authEndpoints.explorerProfile.get('user-1')) {
        return Promise.resolve({
          userId: 'user-1',
          displayName: 'Explorer One',
          profilePictureUrl: '/uploads/avatar.jpg',
          birthDate: '2000-01-01',
          gender: 1,
          bio: 'Cataloging places',
          countryCode: 'EG',
          level: 4,
          isPublic: true,
          isPremium: false,
        });
      }

      if (url === authEndpoints.userStats.get('user-1')) {
        return Promise.resolve({
          id: 'stats-1',
          explorerId: 'user-1',
          availableXp: 120,
          cumulativeXp: 4120,
          currentStreak: 3,
          lastActivityDate: null,
          totalCheckIns: 8,
          totalChallengesCompleted: 2,
          totalAchievementsEarned: 1,
          totalBadgesEarned: 1,
          longestStreak: 5,
        });
      }

      if (url === authEndpoints.user.get('user-1')) {
        return Promise.resolve({
          id: 'user-1',
          name: 'Explorer One',
          email: 'explorer@example.com',
          phoneNumber: '+201001234567',
          role: 1,
        });
      }

      return Promise.reject(new Error(`Unexpected URL ${url}`));
    });

    await expect(getExplorerProfile('user-1')).resolves.toMatchObject({
      id: 'user-1',
      userId: 'user-1',
      name: 'Explorer One',
      displayName: 'Explorer One',
      availableXp: 120,
      cumlativeXp: 4120,
      cumulativeXp: 4120,
      level: 4,
      email: 'explorer@example.com',
      phoneNumber: '+201001234567',
    });
  });
});
