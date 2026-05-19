import { NextApiRequest, NextApiResponse } from "next";
import {
  BannerSeverity,
  MAX_BANNER_TEXT_LENGTH,
  getAnnouncementBanner,
  setAnnouncementBanner,
} from "@/lib/server/admin-banner-store";
import { hasAdminSession } from "@/lib/server/admin-auth";

function isValidSeverity(value: string): value is BannerSeverity {
  return value === "info" || value === "warning" || value === "critical";
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!hasAdminSession(req.headers.cookie)) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  if (req.method === "GET") {
    return res.status(200).json({ banner: getAnnouncementBanner() });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const rawText = typeof req.body?.text === "string" ? req.body.text : "";
  const text = rawText.trim();
  const publishNow = Boolean(req.body?.publishNow);
  const enabled = Boolean(req.body?.enabled);
  const rawStartAt = typeof req.body?.startAt === "string" ? req.body.startAt : "";
  const startAt = rawStartAt.trim() === "" ? null : rawStartAt.trim();
  const rawSeverity = typeof req.body?.severity === "string" ? req.body.severity : "info";
  const severity = isValidSeverity(rawSeverity) ? rawSeverity : "info";

  if (text.length === 0) {
    return res.status(400).json({ success: false, error: "Banner content cannot be empty" });
  }

  if (text.length > MAX_BANNER_TEXT_LENGTH) {
    return res.status(400).json({ success: false, error: `Banner content exceeds ${MAX_BANNER_TEXT_LENGTH} characters` });
  }

  if (!publishNow && startAt === null) {
    return res.status(400).json({ success: false, error: "Select publish now or provide a start time" });
  }

  setAnnouncementBanner({
    text,
    startAt,
    publishNow,
    severity,
    enabled,
    updatedAt: new Date().toISOString(),
    author: "admin console",
  });

  return res.status(200).json({ success: true });
}
