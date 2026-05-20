import type { AnnouncementBanner as AnnouncementBannerState } from "@/lib/server/admin-banner-store";
import { useEffect, useState } from "react";

const severityClasses = {
  info: "border-primary-300 bg-primary-200 text-foreground",
  warning: "border-warning-300 bg-warning-200 text-foreground",
  critical: "border-failure-300 bg-failure-200 text-foreground",
};

export default function AnnouncementBanner() {
  const [banner, setBanner] = useState<AnnouncementBannerState | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchBanner() {
      try {
        const response = await fetch("/api/announcement");
        const result = (await response.json()) as { banner?: AnnouncementBannerState | null };
        if (mounted) {
          setBanner(result.banner ?? null);
        }
      } catch {
        if (mounted) {
          setBanner(null);
        }
      }
    }

    void fetchBanner();
    const interval = window.setInterval(fetchBanner, 30_000);
    window.addEventListener("announcement-banner-updated", fetchBanner);

    return () => {
      mounted = false;
      window.clearInterval(interval);
      window.removeEventListener("announcement-banner-updated", fetchBanner);
    };
  }, []);

  if (!banner) {
    return null;
  }

  return (
    <div className={`border-b-2 px-4 py-3 text-center text-base font-semibold ${severityClasses[banner.severity]}`}>
      {banner.text}
    </div>
  );
}
