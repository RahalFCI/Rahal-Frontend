
const CLAIM_NAME_ID = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
const CLAIM_EMAIL = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';
const CLAIM_ROLE = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

export interface JwtClaims {
  sub: string;
  email: string;
  role: string;
  jti: string;
  exp: number;
  iat: number;
}


export function parseJwtClaims(token: string): JwtClaims {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const payload = JSON.parse(atob(parts[1]));

  return {
    sub: payload[CLAIM_NAME_ID] ?? payload.sub ?? '',
    email: payload[CLAIM_EMAIL] ?? payload.email ?? '',
    role: payload[CLAIM_ROLE] ?? payload.role ?? '',
    jti: payload.jti ?? '',
    exp: payload.exp ?? 0,
    iat: payload.iat ?? 0,
  };
}

/**
 * Checks whether a JWT has expired based on the `exp` claim.
 */
export function isTokenExpired(token: string): boolean {
  try {
    const { exp } = parseJwtClaims(token);
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}
