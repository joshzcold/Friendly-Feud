import type { NextApiRequest, NextApiResponse } from "next";
import {
  buildAdminSessionCookie,
  getLoginThrottleState,
  incrementLoginThrottle,
  isPasswordValid,
  parsePassword,
  resetLoginThrottle,
} from "@/lib/server/admin-auth";

const INVALID_LOGIN_ERROR = "Invalid credentials";

function firstHeaderValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function cleanAddress(value: string): string {
  return value.trim().replace(/^\[|\]$/g, "").replace(/^::ffff:/, "");
}

function isPrivateOrLocalAddress(value: string): boolean {
  const address = cleanAddress(value);
  const parts = address.split(".").map((part) => Number(part));

  if (address === "unknown" || address === "::1" || address === "127.0.0.1" || address === "localhost") {
    return true;
  }

  if (parts.length === 4 && parts.every((part) => Number.isInteger(part))) {
    return (
      parts[0] === 10 ||
      parts[0] === 127 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168)
    );
  }

  return address.startsWith("fc") || address.startsWith("fd") || address.startsWith("fe80:");
}

function getRemoteAddress(req: NextApiRequest): string {
  const socketAddress = req.socket.remoteAddress || "unknown";

  if (!isPrivateOrLocalAddress(socketAddress)) {
    return cleanAddress(socketAddress);
  }

  const realIp = cleanAddress(firstHeaderValue(req.headers["x-real-ip"]));
  if (realIp) {
    return realIp;
  }

  const forwardedForParts = firstHeaderValue(req.headers["x-forwarded-for"])
    .split(",")
    .map((part) => cleanAddress(part))
    .filter(Boolean);

  return forwardedForParts.at(-1) || cleanAddress(socketAddress) || "unknown";
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false });
  }

  const remoteAddress = getRemoteAddress(req);
  const throttleState = getLoginThrottleState(remoteAddress);

  if (!throttleState.allowed) {
    res.setHeader("Retry-After", throttleState.retryAfterSeconds.toString());
    return res.status(429).json({
      success: false,
      error: `Too many login attempts. Try again in ${throttleState.retryAfterSeconds}s.`,
      retryAfterSeconds: throttleState.retryAfterSeconds,
    });
  }

  const envPassword = process.env.ADMIN_CONSOLE_PASSWORD;
  const password = parsePassword(req.body);

  if (!envPassword || !isPasswordValid(password, envPassword)) {
    incrementLoginThrottle(remoteAddress);
    return res.status(401).json({ success: false, error: INVALID_LOGIN_ERROR });
  }

  resetLoginThrottle(remoteAddress);
  res.setHeader("Set-Cookie", buildAdminSessionCookie());

  return res.status(200).json({ success: true });
}
