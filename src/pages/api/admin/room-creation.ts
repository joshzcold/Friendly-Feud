import { hasAdminSession } from "@/lib/server/admin-auth";
import { fetchAdminBackend, sendBackendResponse } from "@/lib/server/admin-backend";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (!hasAdminSession(req.headers.cookie)) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const response = await fetchAdminBackend("/api/internal/admin/room-creation", {
      method: req.method,
      body: req.method === "POST" ? JSON.stringify(req.body || {}) : undefined,
    });

    return sendBackendResponse(res, response);
  } catch (error) {
    return res.status(502).json({
      success: false,
      error: error instanceof Error ? error.message : "Unable to reach backend",
    });
  }
}
