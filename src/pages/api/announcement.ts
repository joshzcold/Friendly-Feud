import { getActiveAnnouncementBanner } from "@/lib/server/admin-banner-store";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ banner: null });
  }

  return res.status(200).json({ banner: getActiveAnnouncementBanner() });
}
