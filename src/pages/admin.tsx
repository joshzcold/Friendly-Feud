import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

const MAX_BANNER_TEXT_LENGTH = 280;
const DESTRUCTIVE_CONFIRM_DELAY_MS = 3_000;

interface AdminPlayerSummary {
  id: string;
  name: string;
  team: number | null;
  isHost: boolean;
  connected: boolean;
}

interface AdminRoomSummary {
  roomCode: string;
  hostId: string;
  playerCount: number;
  sessionCount: number;
  lastActivity: string;
  players: AdminPlayerSummary[];
}

interface AdminRoomsResponse {
  success?: boolean;
  error?: string;
  rooms?: AdminRoomSummary[];
  roomCreationPaused?: boolean;
  ended?: number;
  roomsUpdated?: number;
}

interface BannerResponse {
  success?: boolean;
  error?: string;
  banner?: {
    text: string;
    startAt: string | null;
    publishNow: boolean;
    severity: "info" | "warning" | "critical";
    enabled: boolean;
  } | null;
}

interface LoginResponse {
  success?: boolean;
  error?: string;
  retryAfterSeconds?: number;
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

function toLocalDateTimeInput(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toIsoDateTimeFromLocal(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

interface DestructiveActionButtonProps {
  label: string;
  confirmLabel: string;
  inFlightLabel: string;
  disabled: boolean;
  isRunning: boolean;
  onConfirm: () => void;
  variant?: "grid" | "compact";
}

function DestructiveActionButton({
  label,
  confirmLabel,
  inFlightLabel,
  disabled,
  isRunning,
  onConfirm,
  variant = "grid",
}: DestructiveActionButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  const shapeClassName =
    variant === "compact" ? "rounded-md px-4 py-2 text-base" : "rounded-md p-3 text-left text-lg";
  const sharedClassName = `${shapeClassName} shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60`;

  useEffect(() => {
    if (!isConfirming) {
      return;
    }

    const confirmAtMs = Date.now() + DESTRUCTIVE_CONFIRM_DELAY_MS;

    function updateCountdown() {
      setSecondsRemaining(Math.max(0, Math.ceil((confirmAtMs - Date.now()) / 1000)));
    }

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 250);

    return () => window.clearInterval(intervalId);
  }, [isConfirming]);

  useEffect(() => {
    if (isRunning) {
      setIsConfirming(false);
    }
  }, [isRunning]);

  if (isConfirming) {
    return (
      <div className={variant === "compact" ? "flex flex-wrap items-center gap-2" : "flex flex-wrap gap-2"}>
        <button
          type="button"
          disabled={disabled || secondsRemaining > 0}
          onClick={onConfirm}
          className={`${sharedClassName} bg-failure-500 text-white`}
        >
          {secondsRemaining > 0 ? `Confirm in ${secondsRemaining}s` : confirmLabel}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsConfirming(false)}
          className={`${shapeClassName} bg-secondary-600 text-foreground shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60`}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setIsConfirming(true)}
      className={`${sharedClassName} bg-failure-200 text-foreground`}
    >
      {isRunning ? inFlightLabel : label}
    </button>
  );
}

export default function AdminToolsPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSavingBanner, setIsSavingBanner] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [actionInFlight, setActionInFlight] = useState("");
  const [authError, setAuthError] = useState("");
  const [authRetrySeconds, setAuthRetrySeconds] = useState(0);
  const [lockoutEndsAt, setLockoutEndsAt] = useState<number | null>(null);
  const [adminStatus, setAdminStatus] = useState("");
  const [rooms, setRooms] = useState<AdminRoomSummary[]>([]);
  const [roomCreationPaused, setRoomCreationPaused] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [bannerEnabled, setBannerEnabled] = useState(true);
  const [publishNow, setPublishNow] = useState(true);
  const [bannerStartAt, setBannerStartAt] = useState("");
  const [bannerSeverity, setBannerSeverity] = useState("info");
  const [bannerStatus, setBannerStatus] = useState("");
  const [bannerValidationError, setBannerValidationError] = useState("");

  async function fetchRooms() {
    setIsLoadingRooms(true);

    try {
      const response = await fetch("/api/admin/rooms");
      const result = await readJson<AdminRoomsResponse>(response);

      if (response.status === 401) {
        setIsAuthenticated(false);
        toast.error("Your admin session expired. Please sign in again.");
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to load active sessions");
      }

      setRooms(result.rooms ?? []);
      setRoomCreationPaused(Boolean(result.roomCreationPaused));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load active sessions";
      setAdminStatus(message);
      toast.error(message);
    } finally {
      setIsLoadingRooms(false);
    }
  }

  async function fetchBannerSettings() {
    try {
      const response = await fetch("/api/admin/banner");
      const result = await readJson<BannerResponse>(response);

      if (!response.ok || !result.banner) {
        return;
      }

      setBannerMessage(result.banner.text);
      setBannerEnabled(result.banner.enabled);
      setPublishNow(result.banner.publishNow);
      setBannerStartAt(toLocalDateTimeInput(result.banner.startAt));
      setBannerSeverity(result.banner.severity);
    } catch {
      return;
    }
  }

  async function refreshAdminState() {
    await Promise.all([fetchRooms(), fetchBannerSettings()]);
  }

  useEffect(() => {
    async function checkAdminSession() {
      try {
        const response = await fetch("/api/admin/session");
        const result = (await response.json()) as { authenticated?: boolean };
        const authenticated = Boolean(result.authenticated);
        setIsAuthenticated(authenticated);
        if (authenticated) {
          void refreshAdminState();
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsCheckingSession(false);
      }
    }

    void checkAdminSession();
  }, []);

  useEffect(() => {
    if (lockoutEndsAt === null) {
      setAuthRetrySeconds(0);
      return;
    }

    const lockoutEndMs = lockoutEndsAt;

    function updateRetrySeconds() {
      const seconds = Math.max(0, Math.ceil((lockoutEndMs - Date.now()) / 1000));
      setAuthRetrySeconds(seconds);

      if (seconds === 0) {
        setLockoutEndsAt(null);
      }
    }

    updateRetrySeconds();
    const intervalId = window.setInterval(updateRetrySeconds, 1000);

    return () => window.clearInterval(intervalId);
  }, [lockoutEndsAt]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");

    if (authRetrySeconds > 0) {
      setAuthError(`Too many login attempts. Try again in ${authRetrySeconds}s.`);
      return;
    }

    if (!password.trim()) {
      setAuthError("Please enter your password.");
      return;
    }

    setIsLoggingIn(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const result = (await response.json()) as LoginResponse;

      if (!response.ok || !result.success) {
        setIsAuthenticated(false);
        if (response.status === 429) {
          const headerRetryAfterSeconds = Number(response.headers.get("Retry-After"));
          const retryAfterSeconds = result.retryAfterSeconds ?? headerRetryAfterSeconds;
          const retrySeconds = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0 ? retryAfterSeconds : 60;
          setLockoutEndsAt(Date.now() + retrySeconds * 1000);
        }

        setAuthError(result.error || "Invalid credentials");
        toast.error(result.error || "Invalid credentials");
        return;
      }

      setPassword("");
      setLockoutEndsAt(null);
      setIsAuthenticated(true);
      toast.success("Signed in");
      void refreshAdminState();
    } catch {
      setIsAuthenticated(false);
      setAuthError("Unable to sign in. Please try again.");
      toast.error("Unable to sign in. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    setAuthError("");

    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setIsAuthenticated(false);
      setBannerStatus("");
      setAdminStatus("");
      setRooms([]);
      toast.success("Signed out");
    } finally {
      setIsLoggingOut(false);
    }
  }

  async function runAdminAction(
    actionName: string,
    request: () => Promise<Response>,
    successMessage: (result: AdminRoomsResponse) => string
  ) {
    setActionInFlight(actionName);
    setAdminStatus("");

    try {
      const response = await request();
      const result = await readJson<AdminRoomsResponse>(response);

      if (response.status === 401) {
        setIsAuthenticated(false);
        toast.error("Your admin session expired. Please sign in again.");
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Admin action failed");
      }

      const message = successMessage(result);
      setAdminStatus(message);
      toast.success(message);
      await fetchRooms();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Admin action failed";
      setAdminStatus(message);
      toast.error(message);
    } finally {
      setActionInFlight("");
    }
  }

  async function saveBanner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBannerStatus("");
    setBannerValidationError("");

    const trimmedMessage = bannerMessage.trim();
    if (!trimmedMessage) {
      setBannerValidationError("Banner message is required.");
      toast.error("Banner message is required.");
      return;
    }

    if (trimmedMessage.length > MAX_BANNER_TEXT_LENGTH) {
      const message = `Banner message must be at most ${MAX_BANNER_TEXT_LENGTH} characters.`;
      setBannerValidationError(message);
      toast.error(message);
      return;
    }

    const trimmedStartAt = bannerStartAt.trim();
    const startAtIso = publishNow ? null : toIsoDateTimeFromLocal(trimmedStartAt);

    if (!publishNow && !trimmedStartAt) {
      setBannerValidationError("Choose publish now or provide a start time.");
      toast.error("Choose publish now or provide a start time.");
      return;
    }

    if (!publishNow && !startAtIso) {
      setBannerValidationError("Start time must be a valid date and time.");
      toast.error("Start time must be a valid date and time.");
      return;
    }

    setIsSavingBanner(true);

    try {
      const response = await fetch("/api/admin/banner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: trimmedMessage,
          publishNow,
          startAt: startAtIso,
          severity: bannerSeverity,
          enabled: bannerEnabled,
        }),
      });

      const result = await readJson<BannerResponse>(response);

      if (response.status === 401) {
        setIsAuthenticated(false);
        setBannerStatus("Your admin session expired. Please sign in again.");
        toast.error("Your admin session expired. Please sign in again.");
        return;
      }

      if (!response.ok || !result.success) {
        const message = result.error || "Unable to save banner";
        setBannerStatus(message);
        toast.error(message);
        return;
      }

      setBannerStatus(bannerEnabled ? "Banner saved and visible." : "Banner saved but disabled.");
      toast.success(bannerEnabled ? "Banner saved and visible" : "Banner saved but disabled");
      window.dispatchEvent(new Event("announcement-banner-updated"));
    } finally {
      setIsSavingBanner(false);
    }
  }

  const controlsDisabled = Boolean(actionInFlight);

  return (
    <div className="min-h-screen bg-background p-5 text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-4xl font-semibold">Admin</h1>
        </div>

        <section className="rounded-xl border-2 border-secondary-600 bg-secondary-300 p-6">
          <h2 className="mb-4 text-2xl font-semibold">Login</h2>
          <form className="flex flex-col gap-4 sm:flex-row sm:items-end" onSubmit={handleLogin}>
            <div className="flex grow flex-col gap-2">
              <label htmlFor="adminPassword" className="text-lg">
                Password
              </label>
              <input
                id="adminPassword"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-xl border-4 border-secondary-600 bg-background p-3 text-xl text-foreground"
                placeholder="Enter admin console password"
                disabled={isLoggingIn || isCheckingSession || isAuthenticated || authRetrySeconds > 0}
              />
            </div>
            <button
              type="submit"
              disabled={isLoggingIn || isCheckingSession || isAuthenticated || authRetrySeconds > 0}
              className="rounded-md bg-success-300 px-6 py-3 text-xl uppercase text-foreground shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {authRetrySeconds > 0 ? `Wait ${authRetrySeconds}s` : isLoggingIn ? "Signing in..." : "Sign in"}
            </button>
          </form>
          {authError && <p className="mt-3 text-sm text-failure-500">{authError}</p>}
        </section>

        {!isCheckingSession && isAuthenticated && (
          <>
            <section className="rounded-xl border-2 border-secondary-600 bg-secondary-300 p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold">Maintenance Actions</h2>
                  {adminStatus && <p className="mt-1 text-sm">{adminStatus}</p>}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="rounded-md bg-secondary-600 px-4 py-2 text-base text-foreground shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={controlsDisabled}
                  onClick={() =>
                    void runAdminAction(
                      "reconnect",
                      () => fetch("/api/admin/reconnect-rooms", { method: "POST" }),
                      (result) =>
                        `Reconnected ${result.roomsUpdated ?? 0} active session${result.roomsUpdated === 1 ? "" : "s"}`
                    )
                  }
                  className="rounded-md bg-primary-200 p-3 text-left text-lg text-foreground shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionInFlight === "reconnect" ? "Reconnecting rooms..." : "Reconnect active rooms"}
                </button>
                <button
                  type="button"
                  disabled={controlsDisabled}
                  onClick={() =>
                    void runAdminAction(
                      "pause",
                      () =>
                        fetch("/api/admin/room-creation", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ paused: !roomCreationPaused }),
                        }),
                      () => (roomCreationPaused ? "New room creation resumed" : "New room creation paused")
                    )
                  }
                  className="rounded-md bg-warning-200 p-3 text-left text-lg text-foreground shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionInFlight === "pause"
                    ? "Updating room creation..."
                    : roomCreationPaused
                      ? "Resume new room creation"
                      : "Pause new room creation"}
                </button>
                <DestructiveActionButton
                  label="End all active sessions"
                  confirmLabel="Confirm end all"
                  inFlightLabel="Ending all active sessions..."
                  disabled={controlsDisabled}
                  isRunning={actionInFlight === "end-all"}
                  onConfirm={() =>
                    void runAdminAction(
                      "end-all",
                      () =>
                        fetch("/api/admin/rooms", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({}),
                        }),
                      (result) => `Ended ${result.ended ?? 0} active session${result.ended === 1 ? "" : "s"}`
                    )
                  }
                />
              </div>
            </section>

            <section className="rounded-xl border-2 border-secondary-600 bg-secondary-300 p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold">Active Sessions</h2>
                <button
                  type="button"
                  onClick={() => void fetchRooms()}
                  disabled={isLoadingRooms || controlsDisabled}
                  className="rounded-md bg-secondary-600 px-4 py-2 text-base text-foreground shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoadingRooms ? "Loading..." : "Refresh"}
                </button>
              </div>

              {rooms.length === 0 ? (
                <p className="rounded-md bg-background p-4 text-base">No active sessions.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {rooms.map((room) => (
                    <div key={room.roomCode} className="rounded-md border-2 border-secondary-600 bg-background p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-2xl font-semibold uppercase">{room.roomCode}</p>
                          <p className="text-sm">
                            {room.playerCount} player{room.playerCount === 1 ? "" : "s"} · {room.sessionCount} session
                            {room.sessionCount === 1 ? "" : "s"}
                          </p>
                          {room.lastActivity && (
                            <p className="text-xs">Last activity {new Date(room.lastActivity).toLocaleString()}</p>
                          )}
                        </div>
                        <DestructiveActionButton
                          label="End session"
                          confirmLabel="Confirm end"
                          inFlightLabel="Ending..."
                          disabled={controlsDisabled}
                          isRunning={actionInFlight === `end-${room.roomCode}`}
                          variant="compact"
                          onConfirm={() =>
                            void runAdminAction(
                              `end-${room.roomCode}`,
                              () =>
                                fetch("/api/admin/rooms", {
                                  method: "DELETE",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ roomCode: room.roomCode }),
                                }),
                              () => `Ended session ${room.roomCode}`
                            )
                          }
                        />
                      </div>
                      {room.players.length > 0 && (
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {room.players.map((player) => (
                            <div key={player.id} className="rounded-md bg-secondary-300 px-3 py-2 text-sm">
                              <span className="font-semibold">{player.isHost ? "Host" : player.name}</span>
                              {!player.isHost && player.team !== null && <span> · Team {player.team + 1}</span>}
                              <span> · {player.connected ? "Connected" : "Disconnected"}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-xl border-2 border-secondary-600 bg-secondary-300 p-6">
              <h2 className="mb-4 text-2xl font-semibold">Launch announcement banner</h2>
              <form className="flex flex-col gap-4" onSubmit={saveBanner}>
                <div className="flex flex-col gap-2">
                  <label htmlFor="bannerMessage" className="text-lg">
                    Banner message
                  </label>
                  <textarea
                    id="bannerMessage"
                    value={bannerMessage}
                    onChange={(event) => setBannerMessage(event.target.value)}
                    className="min-h-28 rounded-xl border-4 border-secondary-600 bg-background p-3 text-lg text-foreground"
                    maxLength={MAX_BANNER_TEXT_LENGTH}
                    placeholder="Service update starts at 10:00 UTC"
                    disabled={isSavingBanner}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-lg">Severity</label>
                  <select
                    value={bannerSeverity}
                    onChange={(event) => setBannerSeverity(event.target.value)}
                    className="rounded-xl border-4 border-secondary-600 bg-background p-3 text-lg text-foreground"
                    disabled={isSavingBanner}
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-lg">
                  <input
                    type="checkbox"
                    checked={bannerEnabled}
                    onChange={(event) => setBannerEnabled(event.target.checked)}
                    className="h-5 w-5"
                    disabled={isSavingBanner}
                  />
                  Enable banner
                </label>
                <label className="flex items-center gap-2 text-lg">
                  <input
                    type="checkbox"
                    checked={publishNow}
                    onChange={(event) => setPublishNow(event.target.checked)}
                    className="h-5 w-5"
                    disabled={isSavingBanner}
                  />
                  Publish now
                </label>
                {!publishNow && (
                  <div className="flex flex-col gap-2">
                    <label htmlFor="bannerStartAt" className="text-lg">
                      Start time
                    </label>
                    <input
                      id="bannerStartAt"
                      type="datetime-local"
                      value={bannerStartAt}
                      onChange={(event) => setBannerStartAt(event.target.value)}
                      className="rounded-xl border-4 border-secondary-600 bg-background p-3 text-lg text-foreground"
                      disabled={isSavingBanner}
                    />
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSavingBanner}
                    className="rounded-md bg-success-300 px-5 py-2 text-lg text-foreground shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingBanner ? "Saving..." : "Save banner"}
                  </button>
                </div>
                {bannerValidationError && <p className="text-sm text-failure-500">{bannerValidationError}</p>}
                {bannerStatus && <p className="text-sm">{bannerStatus}</p>}
              </form>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
