import type { AnnouncementBanner as AnnouncementBannerState } from "@/lib/server/admin-banner-store";
import { useEffect, useState } from "react";

const severityClasses = {
  info: "border-primary-300 bg-primary-200 text-foreground",
  warning: "border-warning-300 bg-warning-200 text-foreground",
  critical: "border-failure-300 bg-failure-200 text-foreground",
};

const DISMISSED_BANNER_STORAGE_KEY = "ff_dismissed_announcement_banner";

function getBannerDismissalKey(banner: AnnouncementBannerState) {
  return `${banner.updatedAt}:${banner.severity}:${banner.text}`;
}

function getPublishedLabel(updatedAt: string) {
  const publishedAt = new Date(updatedAt);

  if (Number.isNaN(publishedAt.getTime())) {
    return "Published recently";
  }

  return `Published ${publishedAt.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`;
}

export default function AnnouncementBanner() {
  const [banner, setBanner] = useState<AnnouncementBannerState | null>(null);
  const [dismissedBannerKey, setDismissedBannerKey] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchBanner() {
      try {
        const response = await fetch("/api/announcement");
        const result = (await response.json()) as { banner?: AnnouncementBannerState | null };
        if (mounted) {
          const nextBanner = result.banner ?? null;
          setBanner(nextBanner);
          setDismissedBannerKey(window.sessionStorage.getItem(DISMISSED_BANNER_STORAGE_KEY));
        }
      } catch {
        if (mounted) {
          setBanner(null);
          setDismissedBannerKey(null);
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

  const bannerDismissalKey = getBannerDismissalKey(banner);
  if (dismissedBannerKey === bannerDismissalKey) {
    return null;
  }

  function dismissBanner() {
    window.sessionStorage.setItem(DISMISSED_BANNER_STORAGE_KEY, bannerDismissalKey);
    setDismissedBannerKey(bannerDismissalKey);
  }

  return (
    <div
      className={`flex items-center justify-center gap-3 border-b-2 px-4 py-3 ${severityClasses[banner.severity]}`}
    >
      <div className="min-w-0 flex-1 text-center">
        <p className="text-xs font-semibold uppercase">{getPublishedLabel(banner.updatedAt)}</p>
        <p className="text-base font-semibold">{banner.text}</p>
      </div>
      <button
        type="button"
        onClick={dismissBanner}
        className="shrink-0 rounded-md border-2 border-current px-3 py-1 text-sm font-semibold hover:shadow-sm"
        aria-label="Dismiss announcement"
      >
        Close
      </button>
    </div>
  );
}
