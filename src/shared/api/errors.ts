/**
 * Error taxonomy — maps backend ErrorCodes to front-end behavior.
 * Each code maps to a user-facing message key and a recovery tier.
 *
 * Tiers (claude.md §6.4):
 * - silent: handled by retry logic, user never sees
 * - toast: transient, non-blocking
 * - screen: blocking error state with recovery action
 *
 * Backend serializes its ErrorCode enum as string names (default .NET behavior),
 * e.g. "InvalidCredentials" not 42203. Both numeric and string forms are handled.
 */

export type ErrorTier = 'silent' | 'toast' | 'screen';

export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'VALIDATION_FAILED'
  | 'RATE_LIMITED'
  | 'NETWORK'
  | 'SERVER'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'INVALID_CREDENTIALS'
  | 'ALREADY_EXISTS'
  | 'LOCKED_OUT'
  | 'EMAIL_NOT_VERIFIED'
  | 'PROFILE_SETUP_REQUIRED'
  | 'ALREADY_CHECKED_IN'
  | 'USER_NOT_AT_LOCATION'
  | 'IMPOSSIBLE_TRAVEL'
  | 'LOCATION_SPOOFING_DETECTED'
  | 'UNKNOWN';

interface ErrorMapping {
  messageKey: string;
  tier: ErrorTier;
}

export const errorMap: Record<ErrorCode, ErrorMapping> = {
  UNAUTHORIZED: { messageKey: 'common:error.unauthorized', tier: 'silent' },
  VALIDATION_FAILED: { messageKey: 'common:error.validation', tier: 'toast' },
  RATE_LIMITED: { messageKey: 'common:error.rateLimited', tier: 'toast' },
  NETWORK: { messageKey: 'common:error.network', tier: 'toast' },
  SERVER: { messageKey: 'common:error.server', tier: 'screen' },
  NOT_FOUND: { messageKey: 'common:error.notFound', tier: 'toast' },
  FORBIDDEN: { messageKey: 'common:error.forbidden', tier: 'toast' },
  INVALID_CREDENTIALS: { messageKey: 'auth:errors.invalidCredentials', tier: 'screen' },
  ALREADY_EXISTS: { messageKey: 'auth:errors.alreadyExists', tier: 'screen' },
  LOCKED_OUT: { messageKey: 'auth:errors.lockedOut', tier: 'screen' },
  EMAIL_NOT_VERIFIED: { messageKey: 'auth:errors.emailNotVerified', tier: 'screen' },
  PROFILE_SETUP_REQUIRED: { messageKey: 'common:error.profileSetupRequired', tier: 'screen' },
  ALREADY_CHECKED_IN: { messageKey: 'places:error.alreadyCheckedIn', tier: 'toast' },
  USER_NOT_AT_LOCATION: { messageKey: 'places:error.userNotAtLocation', tier: 'toast' },
  IMPOSSIBLE_TRAVEL: { messageKey: 'places:error.impossibleTravel', tier: 'screen' },
  LOCATION_SPOOFING_DETECTED: { messageKey: 'places:error.locationSpoofingDetected', tier: 'screen' },
  UNKNOWN: { messageKey: 'common:error.unknown', tier: 'screen' },
};

/**
 * Maps backend numeric error codes (enum integer values) to frontend ErrorCode strings.
 */
const backendNumericCodeMap: Record<number, ErrorCode> = {
  40000: 'VALIDATION_FAILED',
  40100: 'UNAUTHORIZED',
  40300: 'FORBIDDEN',
  40301: 'LOCKED_OUT',
  40302: 'EMAIL_NOT_VERIFIED',
  40303: 'PROFILE_SETUP_REQUIRED',
  40400: 'NOT_FOUND',
  40900: 'UNKNOWN',
  40901: 'ALREADY_EXISTS',
  42200: 'VALIDATION_FAILED',
  42201: 'VALIDATION_FAILED',
  42202: 'VALIDATION_FAILED',
  42203: 'INVALID_CREDENTIALS',
  42210: 'UNKNOWN',
  42211: 'ALREADY_CHECKED_IN',
  42212: 'USER_NOT_AT_LOCATION',
  42213: 'IMPOSSIBLE_TRAVEL',
  42214: 'LOCATION_SPOOFING_DETECTED',
  50000: 'SERVER',
  50010: 'SERVER',
  50200: 'SERVER',
  50400: 'SERVER',
};

/**
 * Maps backend string enum names (how .NET serializes by default) to frontend ErrorCode.
 * Matches Shared.Domain.Enums.ErrorCode member names exactly.
 */
const backendStringCodeMap: Record<string, ErrorCode> = {
  None: 'UNKNOWN',
  UnknownError: 'SERVER',
  InvalidRequest: 'VALIDATION_FAILED',
  ValidationError: 'VALIDATION_FAILED',
  InvalidFormat: 'VALIDATION_FAILED',
  InvalidValue: 'VALIDATION_FAILED',
  InvalidCredentials: 'INVALID_CREDENTIALS',
  NotFound: 'NOT_FOUND',
  AlreadyExists: 'ALREADY_EXISTS',
  Conflict: 'UNKNOWN',
  Unauthorized: 'UNAUTHORIZED',
  LockedOut: 'LOCKED_OUT',
  Forbidden: 'FORBIDDEN',
  EmailNotVerified: 'EMAIL_NOT_VERIFIED',
  ProfileSetupRequired: 'PROFILE_SETUP_REQUIRED',
  InvalidOperation: 'VALIDATION_FAILED',
  BusinessRuleViolation: 'UNKNOWN',
  AlreadyCheckedIn: 'ALREADY_CHECKED_IN',
  UserNotAtLocation: 'USER_NOT_AT_LOCATION',
  ImpossibleTravel: 'IMPOSSIBLE_TRAVEL',
  LocationSpoofingDetected: 'LOCATION_SPOOFING_DETECTED',
  DatabaseError: 'SERVER',
  ExternalServiceError: 'SERVER',
  Timeout: 'SERVER',
};

/**
 * Resolves the frontend ErrorCode from a backend error code (numeric or string) and HTTP status.
 * The backend serializes ErrorCode as string enum names by default (.NET System.Text.Json).
 */
export function resolveErrorCode(status: number, backendCode?: number | string): ErrorCode {
  if (backendCode !== undefined && backendCode !== null) {
    if (typeof backendCode === 'string' && backendCode in backendStringCodeMap) {
      return backendStringCodeMap[backendCode];
    }
    if (typeof backendCode === 'number' && backendCode in backendNumericCodeMap) {
      return backendNumericCodeMap[backendCode];
    }
  }
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 422) return 'VALIDATION_FAILED';
  if (status === 429) return 'RATE_LIMITED';
  if (status >= 500) return 'SERVER';
  return 'UNKNOWN';
}

export class ApiError extends Error {
  code: ErrorCode;
  status: number;
  tier: ErrorTier;

  constructor(code: ErrorCode, message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.tier = errorMap[code].tier;
  }
}

/**
 * Validation errors from the backend's ValidationActionFilter.
 * These carry per-field error messages for form integration.
 */
export class ApiValidationError extends ApiError {
  fieldErrors: { property: string; message: string }[];

  constructor(fieldErrors: { property: string; message: string }[]) {
    super('VALIDATION_FAILED', 'Validation failed', 400);
    this.name = 'ApiValidationError';
    this.fieldErrors = fieldErrors;
  }
}
