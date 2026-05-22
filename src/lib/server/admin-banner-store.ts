import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

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

const bannerStore = globalThis as typeof globalThis & {
  friendlyFeudAnnouncementBanner?: AnnouncementBanner | null;
};

function getBannerStorePath() {
  return process.env.ANNOUNCEMENT_BANNER_FILE || join(process.cwd(), ".data", "announcement-banner.json");
}

function isValidSeverity(value: unknown): value is BannerSeverity {
  return value === "info" || value === "warning" || value === "critical";
}

function isAnnouncementBanner(value: unknown): value is AnnouncementBanner {
  if (!value || typeof value !== "object") {
    return false;
  }

  const banner = value as Partial<AnnouncementBanner>;
  return (
    typeof banner.text === "string" &&
    (typeof banner.startAt === "string" || banner.startAt === null) &&
    typeof banner.publishNow === "boolean" &&
    isValidSeverity(banner.severity) &&
    typeof banner.enabled === "boolean" &&
    typeof banner.updatedAt === "string" &&
    typeof banner.author === "string"
  );
}

function readPersistedAnnouncementBanner() {
  const storePath = getBannerStorePath();

  if (!existsSync(storePath)) {
    bannerStore.friendlyFeudAnnouncementBanner = null;
    return null;
  }

  try {
    const parsed = JSON.parse(readFileSync(storePath, "utf8")) as unknown;
    const banner = isAnnouncementBanner(parsed) ? parsed : null;
    bannerStore.friendlyFeudAnnouncementBanner = banner;
    return banner;
  } catch {
    return bannerStore.friendlyFeudAnnouncementBanner ?? null;
  }
}

function writePersistedAnnouncementBanner(nextState: AnnouncementBanner) {
  const storePath = getBannerStorePath();
  mkdirSync(dirname(storePath), { recursive: true });
  writeFileSync(storePath, JSON.stringify(nextState, null, 2));
}

export function getAnnouncementBanner() {
  return readPersistedAnnouncementBanner();
}

export function getActiveAnnouncementBanner(now = new Date()) {
  const bannerState = getAnnouncementBanner();

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
  writePersistedAnnouncementBanner(nextState);
  bannerStore.friendlyFeudAnnouncementBanner = nextState;
}
