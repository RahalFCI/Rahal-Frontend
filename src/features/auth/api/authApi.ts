/**
 * Auth API functions targeting the current Rahal backend controllers.
 * Response unwrapping is handled by apiClient; multipart profile updates use
 * fetch so React Native can set the FormData boundary.
 */
import { apiClient, apiClientNoContent } from '../../../shared/api/client';
import { ApiError, ApiValidationError, resolveErrorCode } from '../../../shared/api/errors';
import { env } from '../../../config/env';
import { useAuthStore } from '../store/authStore';
import { authEndpoints } from './endpoints';

interface BackendExplorerProfileDto {
  userId: string;
  displayName: string;
  profilePictureUrl: string;
  birthDate: string;
  gender: number;
  bio: string;
  countryCode: string;
  level: number;
  isPublic: boolean;
  isPremium: boolean;
}

interface BackendUserDto {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: number;
}

interface ProfilePictureFile {
  uri: string;
  name: string;
  type: string;
}

export interface UserStatsDto {
  id: string;
  explorerId: string;
  availableXp: number;
  cumulativeXp: number;
  currentStreak: number;
  lastActivityDate: string | null;
  totalCheckIns: number;
  totalChallengesCompleted: number;
  totalAchievementsEarned: number;
  totalBadgesEarned: number;
  longestStreak: number;
}

export interface ExplorerProfileDto {
  id: string;
  userId: string;
  name: string;
  displayName: string;
  email?: string;
  phoneNumber?: string;
  profilePictureUrl: string;
  role?: string;
  birthDate: string;
  gender: number;
  bio: string;
  countryCode: string;
  availableXp: number;
  cumlativeXp: number;
  cumulativeXp: number;
  level: number;
  isPublic: boolean;
  isPremium: boolean;
  stats?: UserStatsDto;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiration: string;
  refreshTokenExpiration: string;
}

export interface AuthRequestDto {
  email: string;
  password: string;
}

export interface GoogleSignInRequestDto {
  idToken: string;
}

export interface RegisterExplorerDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  birthDate: string;
  gender: number;
  bio: string;
  countryCode: string;
  isPublic: boolean;
  profilePicture?: ProfilePictureFile;
  userRole?: 'Explorer';
}

export interface CreateExplorerDto {
  displayName: string;
  userId: string;
  birthDate: string;
  gender: number;
  bio: string;
  countryCode: string;
  isPublic: boolean;
  isPremium: boolean;
  profilePicture?: ProfilePictureFile;
}

export interface UpdateExplorerDto {
  displayName: string;
  profilePictureUrl: string;
  profilePicture?: ProfilePictureFile;
  bio: string;
  countryCode: string;
  gender: number;
  isPublic: boolean;
  birthDate: string;
  availableXp: number;
  cumlativeXp: number;
  level: number;
  isPremium: boolean;
}

export interface UpdatePasswordDto {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TokenDto {
  accessToken: string;
  refreshToken: string;
}

export interface VerifyEmailDto {
  email: string;
  otp: string;
}

export interface ResendVerificationDto {
  email: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export function login(body: AuthRequestDto) {
  return apiClient<AuthResponseDto>({
    method: 'POST',
    url: authEndpoints.user.login,
    data: body,
  });
}

export function googleSignIn(body: GoogleSignInRequestDto) {
  return apiClient<AuthResponseDto>({
    method: 'POST',
    url: authEndpoints.user.googleSignIn,
    data: body,
  });
}

export async function register(body: RegisterExplorerDto): Promise<string> {
  const formData = new FormData();
  formData.append('Name', body.name);
  formData.append('Email', body.email);
  formData.append('Password', body.password);
  formData.append('ConfirmPassword', body.confirmPassword);
  formData.append('PhoneNumber', body.phoneNumber);
  formData.append('BirthDate', body.birthDate);
  formData.append('Gender', String(body.gender));
  formData.append('Bio', body.bio);
  formData.append('CountryCode', body.countryCode);
  formData.append('IsPublic', String(body.isPublic));
  if (body.profilePicture) {
    formData.append('profilePicture', body.profilePicture as unknown as Blob);
  }

  let response: Response;
  try {
    response = await fetch(`${env.API_BASE_URL}${authEndpoints.user.register}`, {
      method: 'POST',
      body: formData,
    });
  } catch (err) {
    throw new ApiError('NETWORK', err instanceof Error ? err.message : 'Network request failed', 0);
  }

  const json = (await response.json()) as {
    isSuccess: boolean;
    data?: string;
    errorCode?: number | string;
    errors?: { property: string; message: string }[];
  };

  if (json.isSuccess && typeof json.data === 'string') {
    return json.data;
  }

  if (json.errors && Array.isArray(json.errors)) {
    throw new ApiValidationError(json.errors);
  }

  throw new ApiError(resolveErrorCode(response.status, json.errorCode), 'Registration failed', response.status);
}

export function logout() {
  return apiClientNoContent({
    method: 'POST',
    url: authEndpoints.user.logout,
  });
}

export function refreshTokens(body: TokenDto) {
  return apiClient<AuthResponseDto>({
    method: 'POST',
    url: authEndpoints.auth.refresh,
    data: body,
  });
}

export function verifyEmail(body: VerifyEmailDto) {
  return apiClient<string>({
    method: 'POST',
    url: authEndpoints.emailVerification.verifyEmail,
    data: body,
  });
}

export function resendVerification(body: ResendVerificationDto) {
  return apiClient<string>({
    method: 'POST',
    url: authEndpoints.emailVerification.resendVerification,
    data: body,
  });
}

export function forgotPassword(body: ForgotPasswordDto) {
  return apiClientNoContent({
    method: 'POST',
    url: authEndpoints.auth.forgotPassword,
    data: body,
  });
}

export function resetPassword(body: ResetPasswordDto) {
  return apiClient<string>({
    method: 'POST',
    url: authEndpoints.auth.resetPassword,
    data: body,
  });
}

export function getUser(id: string) {
  return apiClient<BackendUserDto>({
    method: 'GET',
    url: authEndpoints.user.get(id),
  });
}

export function getUserStats(explorerId: string) {
  return apiClient<UserStatsDto>({
    method: 'GET',
    url: authEndpoints.userStats.get(explorerId),
  });
}

export async function getExplorerProfile(id: string): Promise<ExplorerProfileDto> {
  const profile = await apiClient<BackendExplorerProfileDto>({
    method: 'GET',
    url: authEndpoints.explorerProfile.get(id),
  });

  const [stats, user] = await Promise.all([
    getUserStats(profile.userId).catch(() => undefined),
    getUser(profile.userId).catch(() => undefined),
  ]);
  const cumulativeXp = stats?.cumulativeXp ?? 0;

  return {
    id: profile.userId,
    userId: profile.userId,
    name: profile.displayName,
    displayName: profile.displayName,
    email: user?.email,
    phoneNumber: user?.phoneNumber,
    profilePictureUrl: profile.profilePictureUrl,
    birthDate: profile.birthDate,
    gender: profile.gender,
    bio: profile.bio,
    countryCode: profile.countryCode,
    availableXp: stats?.availableXp ?? 0,
    cumlativeXp: cumulativeXp,
    cumulativeXp,
    level: profile.level,
    isPublic: profile.isPublic,
    isPremium: profile.isPremium,
    stats,
  };
}

function explorerProfileFromBackend(
  profile: BackendExplorerProfileDto,
  extras?: {
    availableXp?: number;
    cumulativeXp?: number;
    email?: string;
    phoneNumber?: string;
    stats?: UserStatsDto;
  },
): ExplorerProfileDto {
  const cumulativeXp = extras?.cumulativeXp ?? 0;

  return {
    id: profile.userId,
    userId: profile.userId,
    name: profile.displayName,
    displayName: profile.displayName,
    email: extras?.email,
    phoneNumber: extras?.phoneNumber,
    profilePictureUrl: profile.profilePictureUrl,
    birthDate: profile.birthDate,
    gender: profile.gender,
    bio: profile.bio,
    countryCode: profile.countryCode,
    availableXp: extras?.availableXp ?? 0,
    cumlativeXp: cumulativeXp,
    cumulativeXp,
    level: profile.level,
    isPublic: profile.isPublic,
    isPremium: profile.isPremium,
    stats: extras?.stats,
  };
}

async function parseExplorerProfileFormResponse(
  response: Response,
  fallbackMessage: string,
): Promise<BackendExplorerProfileDto> {
  const json = (await response.json()) as {
    isSuccess: boolean;
    data?: BackendExplorerProfileDto;
    errorCode?: number | string;
    errors?: { property: string; message: string }[];
  };

  if (json.isSuccess && json.data !== undefined) {
    return json.data;
  }

  if (json.errors && Array.isArray(json.errors)) {
    throw new ApiValidationError(json.errors);
  }

  throw new ApiError(resolveErrorCode(response.status, json.errorCode), fallbackMessage, response.status);
}

export async function createExplorerProfile(body: CreateExplorerDto): Promise<ExplorerProfileDto> {
  const accessToken = useAuthStore.getState().accessToken;

  const formData = new FormData();
  formData.append('DisplayName', body.displayName);
  formData.append('UserId', body.userId);
  formData.append('BirthDate', body.birthDate);
  formData.append('Gender', String(body.gender));
  formData.append('Bio', body.bio);
  formData.append('CountryCode', body.countryCode);
  formData.append('IsPublic', String(body.isPublic));
  formData.append('IsPremium', String(body.isPremium));
  if (body.profilePicture) {
    formData.append('profilePicture', body.profilePicture as unknown as Blob);
  }

  let response: Response;
  try {
    response = await fetch(`${env.API_BASE_URL}${authEndpoints.explorerProfile.create}`, {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: formData,
    });
  } catch (err) {
    throw new ApiError('NETWORK', err instanceof Error ? err.message : 'Network request failed', 0);
  }

  const created = await parseExplorerProfileFormResponse(response, 'Profile creation failed');
  return explorerProfileFromBackend(created);
}

async function updateExplorerProfilePicture(
  id: string,
  profilePicture: ProfilePictureFile,
): Promise<string> {
  const accessToken = useAuthStore.getState().accessToken;
  const formData = new FormData();
  formData.append('profilePicture', profilePicture as unknown as Blob);

  let response: Response;
  try {
    response = await fetch(`${env.API_BASE_URL}${authEndpoints.explorerProfile.updatePicture(id)}`, {
      method: 'PUT',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: formData,
    });
  } catch (err) {
    throw new ApiError('NETWORK', err instanceof Error ? err.message : 'Network request failed', 0);
  }

  const json = (await response.json()) as {
    isSuccess: boolean;
    data?: string;
    errorCode?: number | string;
    errors?: { property: string; message: string }[];
  };

  if (json.isSuccess && typeof json.data === 'string') {
    return json.data;
  }

  if (json.errors && Array.isArray(json.errors)) {
    throw new ApiValidationError(json.errors);
  }

  throw new ApiError(
    resolveErrorCode(response.status, json.errorCode),
    'Profile picture update failed',
    response.status,
  );
}

export async function updateExplorerProfile(
  id: string,
  body: UpdateExplorerDto,
): Promise<ExplorerProfileDto> {
  const accessToken = useAuthStore.getState().accessToken;

  const formData = new FormData();
  let profilePictureUrl = body.profilePictureUrl;

  if (body.profilePicture) {
    profilePictureUrl = await updateExplorerProfilePicture(id, body.profilePicture);
  }

  formData.append('UserId', id);
  formData.append('DisplayName', body.displayName);
  formData.append('ProfilePictureUrl', profilePictureUrl);
  formData.append('BirthDate', body.birthDate);
  formData.append('Gender', String(body.gender));
  formData.append('Bio', body.bio);
  formData.append('CountryCode', body.countryCode);
  formData.append('AvailableXp', String(body.availableXp));
  formData.append('CumlativeXp', String(body.cumlativeXp));
  formData.append('Level', String(body.level));
  formData.append('IsPublic', String(body.isPublic));
  formData.append('IsPremium', String(body.isPremium));

  let response: Response;
  try {
    response = await fetch(`${env.API_BASE_URL}${authEndpoints.explorerProfile.update(id)}`, {
      method: 'PUT',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: formData,
    });
  } catch (err) {
    throw new ApiError('NETWORK', err instanceof Error ? err.message : 'Network request failed', 0);
  }

  const updated = await parseExplorerProfileFormResponse(response, 'Update failed');
  return explorerProfileFromBackend(updated, {
    availableXp: body.availableXp,
    cumulativeXp: body.cumlativeXp,
  });
}

export function updatePassword(id: string, body: UpdatePasswordDto) {
  return apiClient<string>({
    method: 'PUT',
    url: authEndpoints.user.updatePassword(id),
    data: body,
  });
}
