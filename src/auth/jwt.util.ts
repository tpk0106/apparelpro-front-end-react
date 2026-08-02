// Lightweight JWT payload decoder - deliberately not pulling in the jwt-decode
// package for a single base64url-decode-and-JSON.parse. Reads the same
// localStorage key AxiosInterceptor uses internally (see axiosClient.ts's
// private `tokenKey = "token"`).

interface DecodedTokenPayload {
  role?: string | string[];
  [key: string]: unknown;
}

const TOKEN_STORAGE_KEY = "token";

function base64UrlDecode(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(padded);
}

export function decodeJwtPayload(): DecodedTokenPayload | null {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const json = base64UrlDecode(parts[1]);
    return JSON.parse(json) as DecodedTokenPayload;
  } catch {
    return null;
  }
}

// The backend issues one ClaimTypes.Role claim per role (SecurityService.GetClaimsAsync),
// which JwtSecurityTokenHandler serializes under the short "role" claim name by default.
// A single role comes through as a string; multiple roles come through as a string array -
// handle both rather than assuming one shape.
export function getCurrentUserRoles(): string[] {
  const payload = decodeJwtPayload();
  if (!payload) return [];

  const roleClaim =
    payload.role ??
    payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"];

  if (!roleClaim) return [];
  return Array.isArray(roleClaim) ? (roleClaim as string[]) : [roleClaim as string];
}

export function isAdministrator(): boolean {
  return getCurrentUserRoles().includes("Administrator");
}
