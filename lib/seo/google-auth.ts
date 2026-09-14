import crypto from "node:crypto";

/**
 * Service-account auth for the Google APIs, done by hand.
 *
 * googleapis is a very large dependency for what amounts to signing a JWT and
 * exchanging it for a token, and it would land in the serverless bundle for
 * every route that touches SEO data. This is the whole protocol in forty lines.
 */

export type ServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri: string;
};

export const SCOPES = {
  searchConsole: "https://www.googleapis.com/auth/webmasters.readonly",
  analytics: "https://www.googleapis.com/auth/analytics.readonly",
} as const;

/** Cached per scope — tokens last an hour and re-signing on every call is waste. */
const tokenCache = new Map<string, { token: string; expiresAt: number }>();

export function readServiceAccount(): ServiceAccount | null {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_B64;
  if (!b64) return null;
  try {
    const parsed = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
    if (!parsed.client_email || !parsed.private_key) return null;
    return parsed as ServiceAccount;
  } catch {
    return null;
  }
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export async function getAccessToken(scopes: string[]): Promise<string | null> {
  const account = readServiceAccount();
  if (!account) return null;

  const scope = scopes.join(" ");
  const cached = tokenCache.get(scope);
  // Refresh a minute early so a token never expires mid-request.
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: account.client_email,
      scope,
      aud: account.token_uri,
      exp: now + 3600,
      iat: now,
    })
  );

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = base64url(signer.sign(account.private_key));

  const res = await fetch(account.token_uri, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${signature}`,
    }),
  });

  if (!res.ok) {
    console.error("[google-auth] token exchange failed:", res.status);
    return null;
  }

  const body = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache.set(scope, {
    token: body.access_token,
    expiresAt: Date.now() + body.expires_in * 1000,
  });
  return body.access_token;
}
