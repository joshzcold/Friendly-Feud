import { hasAdminSession } from "@/lib/server/admin-auth";
import {
  BannerSeverity,
  getAnnouncementBanner,
  MAX_BANNER_TEXT_LENGTH,
  setAnnouncementBanner,
} from "@/lib/server/admin-banner-store";
import { NextApiRequest, NextApiResponse } from "next";

function isValidSeverity(value: string): value is BannerSeverity {
  return value === "info" || value === "warning" || value === "critical";
}

function readRequiredBoolean(value: unknown, fieldName: string) {
  if (typeof value !== "boolean") {
    return { error: `${fieldName} must be a boolean` };
  }

  return { value };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store, max-age=0");

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
  const publishNowResult = readRequiredBoolean(req.body?.publishNow, "publishNow");
  const enabledResult = readRequiredBoolean(req.body?.enabled, "enabled");
  const rawStartAt = typeof req.body?.startAt === "string" ? req.body.startAt : "";
  const startAt = rawStartAt.trim() === "" ? null : rawStartAt.trim();
  const rawSeverity = typeof req.body?.severity === "string" ? req.body.severity : "info";
  const severity = isValidSeverity(rawSeverity) ? rawSeverity : "info";

  if ("error" in publishNowResult) {
    return res.status(400).json({ success: false, error: publishNowResult.error });
  }

  if ("error" in enabledResult) {
    return res.status(400).json({ success: false, error: enabledResult.error });
  }

  if (text.length === 0) {
    return res.status(400).json({ success: false, error: "Banner content cannot be empty" });
  }

  if (text.length > MAX_BANNER_TEXT_LENGTH) {
    return res
      .status(400)
      .json({ success: false, error: `Banner content exceeds ${MAX_BANNER_TEXT_LENGTH} characters` });
  }

  if (!publishNowResult.value && startAt === null) {
    return res.status(400).json({ success: false, error: "Select publish now or provide a start time" });
  }

  try {
    setAnnouncementBanner({
      text,
      startAt,
      publishNow: publishNowResult.value,
      severity,
      enabled: enabledResult.value,
      updatedAt: new Date().toISOString(),
      author: "admin console",
    });
  } catch {
    return res.status(500).json({ success: false, error: "Unable to persist banner" });
  }

  return res.status(200).json({ success: true, banner: getAnnouncementBanner() });
}
