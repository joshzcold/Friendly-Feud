import type { NextApiRequest, NextApiResponse } from "next";
import { hasAdminSession } from "@/lib/server/admin-auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ authenticated: false });
  }

  return res.status(200).json({ authenticated: hasAdminSession(req.headers.cookie) });
}
