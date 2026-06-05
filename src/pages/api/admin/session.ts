import type { NextApiRequest, NextApiResponse } from "next";
import { hasAdminSession } from "@/lib/server/admin-auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ authenticated: false });
  }

  return res.status(200).json({ authenticated: hasAdminSession(req.headers.cookie) });
}
