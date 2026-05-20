export const MAX_BANNER_TEXT_LENGTH = 280;

export type BannerSeverity = "info" | "warning" | "critical";

export interface AnnouncementBanner {
  text: string;
  startAt: string | null;
  publishNow: boolean;
  severity: BannerSeverity;
  enabled: boolean;
  updatedAt: string;
  author: string;
}

let bannerState: AnnouncementBanner | null = null;

export function getAnnouncementBanner() {
  return bannerState;
}

export function getActiveAnnouncementBanner(now = new Date()) {
  if (!bannerState?.enabled) {
    return null;
  }

  if (bannerState.publishNow) {
    return bannerState;
  }

  if (!bannerState.startAt) {
    return null;
  }

  const startAt = new Date(bannerState.startAt);
  if (Number.isNaN(startAt.getTime())) {
    return null;
  }

  return startAt <= now ? bannerState : null;
}

export function setAnnouncementBanner(nextState: AnnouncementBanner) {
  bannerState = nextState;
}
