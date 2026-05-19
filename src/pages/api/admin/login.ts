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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false });
  }

  const remoteAddress = req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.socket.remoteAddress || "unknown";
  const throttleState = getLoginThrottleState(remoteAddress);

  if (!throttleState.allowed) {
    res.setHeader("Retry-After", throttleState.retryAfterSeconds.toString());
    return res.status(429).json({ success: false, error: "Too many login attempts. Try again shortly." });
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
