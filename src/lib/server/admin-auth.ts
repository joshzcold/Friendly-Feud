import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE_NAME = "ff_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 15;

type LoginAttemptState = { failedAttempts: number; nextAllowedAtMs: number; updatedAtMs: number };

const LOGIN_COOLDOWN_MS = 60_000;
const LOGIN_ATTEMPT_LIMIT = 5;
const LOGIN_ATTEMPT_TTL_MS = LOGIN_COOLDOWN_MS + 5 * 60_000;
const LOGIN_ATTEMPT_MAX_ENTRIES = 10_000;
const CLOCK_SKEW_MS = 5 * 60_000;

const loginAttempts = new Map<string, LoginAttemptState>();

function pruneLoginAttempts(now = Date.now()) {
  for (const [remoteAddress, state] of loginAttempts) {
    if (now - state.updatedAtMs > LOGIN_ATTEMPT_TTL_MS) {
      loginAttempts.delete(remoteAddress);
    }
  }

  while (loginAttempts.size > LOGIN_ATTEMPT_MAX_ENTRIES) {
    const oldestRemoteAddress = loginAttempts.keys().next().value;
    if (oldestRemoteAddress === undefined) {
      return;
    }

    loginAttempts.delete(oldestRemoteAddress);
  }
}

export function parsePassword(body: unknown): string {
  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body);
      return typeof parsed?.password === "string" ? parsed.password : "";
    } catch {
      return "";
    }
  }

  if (body && typeof body === "object" && "password" in body) {
    const maybePassword = (body as { password?: unknown }).password;
    return typeof maybePassword === "string" ? maybePassword : "";
  }

  return "";
}

export function isPasswordValid(password: string, envPassword: string): boolean {
  const passwordBuffer = Buffer.from(password);
  const envPasswordBuffer = Buffer.from(envPassword);

  if (passwordBuffer.length !== envPasswordBuffer.length) {
    return false;
  }

  return timingSafeEqual(passwordBuffer, envPasswordBuffer);
}

function parseCookies(cookieHeader?: string): Map<string, string> {
  const cookies = new Map<string, string>();

  if (!cookieHeader) {
    return cookies;
  }

  for (const cookiePart of cookieHeader.split(";")) {
    const [rawName, ...rawValueParts] = cookiePart.trim().split("=");
    if (!rawName || rawValueParts.length === 0) {
      continue;
    }

    cookies.set(rawName, rawValueParts.join("="));
  }

  return cookies;
}

function getAdminSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_CONSOLE_PASSWORD || "";
}

function signAdminSession(issuedAtMs: number, secret: string): string {
  return createHmac("sha256", secret).update(`admin-session:${issuedAtMs}`).digest("base64url");
}

function isSignatureValid(value: string, expectedValue: string): boolean {
  const valueBuffer = Buffer.from(value);
  const expectedValueBuffer = Buffer.from(expectedValue);

  if (valueBuffer.length !== expectedValueBuffer.length) {
    return false;
  }

  return timingSafeEqual(valueBuffer, expectedValueBuffer);
}

export function hasAdminSession(cookieHeader?: string): boolean {
  const secret = getAdminSessionSecret();
  if (!secret) {
    return false;
  }

  const cookieValue = parseCookies(cookieHeader).get(ADMIN_COOKIE_NAME);
  if (!cookieValue) {
    return false;
  }

  const [issuedAtValue, signature] = cookieValue.split(".");
  const issuedAtMs = Number(issuedAtValue);
  if (!Number.isSafeInteger(issuedAtMs) || !signature) {
    return false;
  }

  const now = Date.now();
  if (issuedAtMs > now + CLOCK_SKEW_MS || now - issuedAtMs > ADMIN_SESSION_MAX_AGE_SECONDS * 1000) {
    return false;
  }

  return isSignatureValid(signature, signAdminSession(issuedAtMs, secret));
}

export function buildAdminSessionCookie(): string {
  const secret = getAdminSessionSecret();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET or ADMIN_CONSOLE_PASSWORD is required to create an admin session");
  }

  const isProduction = process.env.NODE_ENV === "production";
  const issuedAtMs = Date.now();
  const cookieValue = `${issuedAtMs}.${signAdminSession(issuedAtMs, secret)}`;

  return `${ADMIN_COOKIE_NAME}=${cookieValue}; Max-Age=${ADMIN_SESSION_MAX_AGE_SECONDS}; Path=/; HttpOnly; SameSite=Strict${isProduction ? "; Secure" : ""}`;
}

export function buildAdminSessionClearCookie(): string {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = `Max-Age=0; Path=/; HttpOnly; SameSite=Strict${isProduction ? "; Secure" : ""}`;

  return `${ADMIN_COOKIE_NAME}=; ${cookieOptions}`;
}

export function getLoginThrottleState(remoteAddress: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  pruneLoginAttempts(now);

  const attemptState = loginAttempts.get(remoteAddress);

  if (!attemptState || attemptState.failedAttempts < LOGIN_ATTEMPT_LIMIT) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (now >= attemptState.nextAllowedAtMs) {
    loginAttempts.delete(remoteAddress);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return { allowed: false, retryAfterSeconds: Math.ceil((attemptState.nextAllowedAtMs - now) / 1000) };
}

export function incrementLoginThrottle(remoteAddress: string) {
  const now = Date.now();
  pruneLoginAttempts(now);

  const state = loginAttempts.get(remoteAddress);

  if (!state) {
    loginAttempts.set(remoteAddress, { failedAttempts: 1, nextAllowedAtMs: 0, updatedAtMs: now });
    return;
  }

  if (state.failedAttempts >= LOGIN_ATTEMPT_LIMIT && now >= state.nextAllowedAtMs) {
    loginAttempts.set(remoteAddress, { failedAttempts: 1, nextAllowedAtMs: 0, updatedAtMs: now });
    return;
  }

  state.failedAttempts += 1;
  state.updatedAtMs = now;
  if (state.failedAttempts >= LOGIN_ATTEMPT_LIMIT) {
    state.nextAllowedAtMs = now + LOGIN_COOLDOWN_MS;
  }

  loginAttempts.set(remoteAddress, state);
}

export function resetLoginThrottle(remoteAddress: string) {
  loginAttempts.delete(remoteAddress);
}
