import { hasAdminSession } from "@/lib/server/admin-auth";
import { fetchAdminBackend, sendBackendResponse } from "@/lib/server/admin-backend";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!hasAdminSession(req.headers.cookie)) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const response = await fetchAdminBackend("/api/internal/admin/reconnect-rooms", {
      method: "POST",
    });

    return sendBackendResponse(res, response);
  } catch (error) {
    return res.status(502).json({
      success: false,
      error: error instanceof Error ? error.message : "Unable to reach backend",
    });
  }
}
