import { getActiveAnnouncementBanner, toPublicAnnouncementBanner } from "@/lib/server/admin-banner-store";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ banner: null });
  }

  return res.status(200).json({ banner: toPublicAnnouncementBanner(getActiveAnnouncementBanner()) });
}
