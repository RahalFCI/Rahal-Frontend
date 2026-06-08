import { describe, expect, it } from 'vitest';
import { ApiValidationError, errorMap, resolveErrorCode } from './errors';

describe('resolveErrorCode', () => {
  it('maps backend string enum names used by System.Text.Json', () => {
    expect(resolveErrorCode(401, 'InvalidCredentials')).toBe('INVALID_CREDENTIALS');
    expect(resolveErrorCode(403, 'EmailNotVerified')).toBe('EMAIL_NOT_VERIFIED');
    expect(resolveErrorCode(403, 'ProfileSetupRequired')).toBe('PROFILE_SETUP_REQUIRED');
  });

  it('maps backend numeric enum values for compatibility', () => {
    expect(resolveErrorCode(403, 40303)).toBe('PROFILE_SETUP_REQUIRED');
    expect(resolveErrorCode(409, 40901)).toBe('ALREADY_EXISTS');
    expect(resolveErrorCode(422, 42211)).toBe('ALREADY_CHECKED_IN');
    expect(resolveErrorCode(422, 42212)).toBe('USER_NOT_AT_LOCATION');
    expect(resolveErrorCode(422, 42213)).toBe('IMPOSSIBLE_TRAVEL');
    expect(resolveErrorCode(422, 42214)).toBe('LOCATION_SPOOFING_DETECTED');
  });

  it('maps backend location and check-in string enum names', () => {
    expect(resolveErrorCode(422, 'AlreadyCheckedIn')).toBe('ALREADY_CHECKED_IN');
    expect(resolveErrorCode(422, 'UserNotAtLocation')).toBe('USER_NOT_AT_LOCATION');
    expect(resolveErrorCode(422, 'ImpossibleTravel')).toBe('IMPOSSIBLE_TRAVEL');
    expect(resolveErrorCode(422, 'LocationSpoofingDetected')).toBe('LOCATION_SPOOFING_DETECTED');
  });

  it('falls back to HTTP status when no backend code is available', () => {
    expect(resolveErrorCode(401)).toBe('UNAUTHORIZED');
    expect(resolveErrorCode(429)).toBe('RATE_LIMITED');
    expect(resolveErrorCode(500)).toBe('SERVER');
  });
});

describe('ApiValidationError', () => {
  it('preserves backend field errors for forms', () => {
    const error = new ApiValidationError([{ property: 'Email', message: 'Email is required' }]);

    expect(error.code).toBe('VALIDATION_FAILED');
    expect(error.tier).toBe(errorMap.VALIDATION_FAILED.tier);
    expect(error.fieldErrors).toEqual([{ property: 'Email', message: 'Email is required' }]);
  });
});
