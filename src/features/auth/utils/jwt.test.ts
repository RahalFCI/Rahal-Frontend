import { describe, expect, it } from 'vitest';
import { isTokenExpired, parseJwtClaims } from './jwt';

const nameIdClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
const emailClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';
const roleClaim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

function tokenWithPayload(payload: Record<string, unknown>) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
  return `header.${encodedPayload}.signature`;
}

describe('parseJwtClaims', () => {
  it('supports ASP.NET claim URI names emitted by the backend', () => {
    const token = tokenWithPayload({
      [nameIdClaim]: 'user-1',
      [emailClaim]: 'explorer@example.com',
      [roleClaim]: 'Explorer',
      jti: 'jwt-id',
      exp: 9999999999,
      iat: 1710000000,
    });

    expect(parseJwtClaims(token)).toEqual({
      sub: 'user-1',
      email: 'explorer@example.com',
      role: 'Explorer',
      jti: 'jwt-id',
      exp: 9999999999,
      iat: 1710000000,
    });
  });

  it('treats invalid JWTs as expired', () => {
    expect(isTokenExpired('not-a-token')).toBe(true);
  });
});
