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

export function setAnnouncementBanner(nextState: AnnouncementBanner) {
  bannerState = nextState;
}
