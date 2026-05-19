import { timingSafeEqual } from "crypto";

export const ADMIN_COOKIE_NAME = "admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 15;

const loginAttempts = new Map<string, { count: number; windowStartMs: number }>();
const LOGIN_WINDOW_MS = 60_000;
const LOGIN_ATTEMPT_LIMIT = 5;

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

export function hasAdminSession(cookieHeader?: string): boolean {
  if (!cookieHeader) {
    return false;
  }

  const cookieParts = cookieHeader.split(";").map((part) => part.trim());
  return cookieParts.includes(`${ADMIN_COOKIE_NAME}=1`);
}

export function buildAdminSessionCookie(): string {
  const isProduction = process.env.NODE_ENV === "production";
  return `${ADMIN_COOKIE_NAME}=1; Max-Age=${ADMIN_SESSION_MAX_AGE_SECONDS}; Path=/; HttpOnly; SameSite=Strict${isProduction ? "; Secure" : ""}`;
}

export function buildAdminSessionClearCookie(): string {
  const isProduction = process.env.NODE_ENV === "production";
  return `${ADMIN_COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict${isProduction ? "; Secure" : ""}`;
}

export function getLoginThrottleState(remoteAddress: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const attemptState = loginAttempts.get(remoteAddress);

  if (!attemptState || now - attemptState.windowStartMs > LOGIN_WINDOW_MS) {
    loginAttempts.set(remoteAddress, { count: 0, windowStartMs: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (attemptState.count >= LOGIN_ATTEMPT_LIMIT) {
    const retryAfterMs = LOGIN_WINDOW_MS - (now - attemptState.windowStartMs);
    return { allowed: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function incrementLoginThrottle(remoteAddress: string) {
  const now = Date.now();
  const state = loginAttempts.get(remoteAddress);

  if (!state || now - state.windowStartMs > LOGIN_WINDOW_MS) {
    loginAttempts.set(remoteAddress, { count: 1, windowStartMs: now });
    return;
  }

  state.count += 1;
  loginAttempts.set(remoteAddress, state);
}

export function resetLoginThrottle(remoteAddress: string) {
  loginAttempts.delete(remoteAddress);
}
