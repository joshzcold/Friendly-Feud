import { mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "fs";
import { dirname, join, relative } from "path";

export const MAX_BANNER_TEXT_LENGTH = 280;
const BANNER_CACHE_REFRESH_INTERVAL_MS = 5_000;

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

export type PublicAnnouncementBanner = Pick<AnnouncementBanner, "text" | "severity" | "updatedAt">;

const bannerStore = globalThis as typeof globalThis & {
  friendlyFeudAnnouncementBanner?: AnnouncementBanner | null;
  friendlyFeudAnnouncementBannerMtimeMs?: number | null;
  friendlyFeudAnnouncementBannerPath?: string;
  friendlyFeudAnnouncementBannerCheckedAtMs?: number;
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

function cacheAnnouncementBanner(storePath: string, banner: AnnouncementBanner | null, mtimeMs: number | null) {
  bannerStore.friendlyFeudAnnouncementBanner = banner;
  bannerStore.friendlyFeudAnnouncementBannerMtimeMs = mtimeMs;
  bannerStore.friendlyFeudAnnouncementBannerPath = storePath;
  bannerStore.friendlyFeudAnnouncementBannerCheckedAtMs = Date.now();
}

function getCachedAnnouncementBanner(storePath: string) {
  if (bannerStore.friendlyFeudAnnouncementBannerPath !== storePath) {
    return undefined;
  }

  const checkedAtMs = bannerStore.friendlyFeudAnnouncementBannerCheckedAtMs;
  if (checkedAtMs === undefined || Date.now() - checkedAtMs > BANNER_CACHE_REFRESH_INTERVAL_MS) {
    return undefined;
  }

  return bannerStore.friendlyFeudAnnouncementBanner ?? null;
}

function readPersistedAnnouncementBanner() {
  const storePath = getBannerStorePath();
  const cachedBanner = getCachedAnnouncementBanner(storePath);

  if (cachedBanner !== undefined) {
    return cachedBanner;
  }

  try {
    const mtimeMs = statSync(storePath).mtimeMs;

    if (
      bannerStore.friendlyFeudAnnouncementBannerPath === storePath &&
      bannerStore.friendlyFeudAnnouncementBannerMtimeMs === mtimeMs
    ) {
      bannerStore.friendlyFeudAnnouncementBannerCheckedAtMs = Date.now();
      return bannerStore.friendlyFeudAnnouncementBanner ?? null;
    }

    const parsed = JSON.parse(readFileSync(storePath, "utf8")) as unknown;
    const banner = isAnnouncementBanner(parsed) ? parsed : null;
    cacheAnnouncementBanner(storePath, banner, mtimeMs);
    return banner;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      cacheAnnouncementBanner(storePath, null, null);
      return null;
    }

    if (bannerStore.friendlyFeudAnnouncementBannerPath === storePath) {
      return bannerStore.friendlyFeudAnnouncementBanner ?? null;
    }

    return null;
  }
}

function writePersistedAnnouncementBanner(nextState: AnnouncementBanner) {
  const storePath = getBannerStorePath();
  const storeDir = dirname(storePath);
  const tempPath = join(storeDir, `.${relative(storeDir, storePath)}.${process.pid}.${Date.now()}.tmp`);

  mkdirSync(storeDir, { recursive: true });
  writeFileSync(tempPath, JSON.stringify(nextState, null, 2));
  renameSync(tempPath, storePath);
  cacheAnnouncementBanner(storePath, nextState, statSync(storePath).mtimeMs);
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

export function toPublicAnnouncementBanner(banner: AnnouncementBanner | null): PublicAnnouncementBanner | null {
  if (!banner) {
    return null;
  }

  return {
    text: banner.text,
    severity: banner.severity,
    updatedAt: banner.updatedAt,
  };
}

export function setAnnouncementBanner(nextState: AnnouncementBanner) {
  writePersistedAnnouncementBanner(nextState);
}
