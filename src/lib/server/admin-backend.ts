import type { NextApiResponse } from "next";

function getBackendUrls() {
  const configuredUrl = process.env.ADMIN_BACKEND_URL || process.env.BACKEND_URL;
  const urls = configuredUrl ? [configuredUrl] : ["http://backend:8080", "http://localhost:8080"];
  return urls.map((url) => url.replace(/\/$/, ""));
}

export async function fetchAdminBackend(path: string, init: RequestInit = {}) {
  const adminPassword = process.env.ADMIN_CONSOLE_PASSWORD;
  if (!adminPassword) {
    throw new Error("ADMIN_CONSOLE_PASSWORD is not configured");
  }

  const headers = new Headers(init.headers);
  headers.set("X-Admin-Password", adminPassword);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let lastError: unknown;
  for (const baseUrl of getBackendUrls()) {
    try {
      return await fetch(`${baseUrl}${path}`, {
        ...init,
        headers,
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Unable to reach backend");
}

export async function sendBackendResponse(res: NextApiResponse, response: Response) {
  const contentType = response.headers.get("Content-Type");
  if (contentType) {
    res.setHeader("Content-Type", contentType);
  }

  res.status(response.status).send(await response.text());
}
