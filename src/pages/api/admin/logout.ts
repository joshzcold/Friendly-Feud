import type { NextApiRequest, NextApiResponse } from "next";
import { buildAdminSessionClearCookie } from "@/lib/server/admin-auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false });
  }

  res.setHeader("Set-Cookie", buildAdminSessionClearCookie());
  return res.status(200).json({ success: true });
}
