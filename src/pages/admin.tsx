import HelpButton from "@/components/HelpButton";
import ThemeSwitcher from "@/components/Admin/ThemeSwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { GameTheme } from "../types";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

const MAX_BANNER_TEXT_LENGTH = 280;

export default function AdminToolsPage() {
  const [themeState, setThemeState] = useState<GameTheme>({ settings: { theme: "default" } });
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSavingBanner, setIsSavingBanner] = useState(false);
  const [authError, setAuthError] = useState("");
  const [bannerMessage, setBannerMessage] = useState("");
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [publishNow, setPublishNow] = useState(true);
  const [bannerStartAt, setBannerStartAt] = useState("");
  const [bannerSeverity, setBannerSeverity] = useState("info");
  const [bannerStatus, setBannerStatus] = useState("");
  const [bannerValidationError, setBannerValidationError] = useState("");

  useEffect(() => {
    async function checkAdminSession() {
      try {
        const response = await fetch("/api/admin/session");
        const result = (await response.json()) as { authenticated?: boolean };
        setIsAuthenticated(Boolean(result.authenticated));
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsCheckingSession(false);
      }
    }

    void checkAdminSession();
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");

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

      const result = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !result.success) {
        setIsAuthenticated(false);
        setAuthError(result.error || "Invalid credentials");
        return;
      }

      setPassword("");
      setIsAuthenticated(true);
      toast.success("Signed in");
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
      toast.success("Signed out");
    } finally {
      setIsLoggingOut(false);
    }
  }

  async function saveBanner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBannerStatus("");
    setBannerValidationError("");

    const trimmedMessage = bannerMessage.trim();
    if (!trimmedMessage) {
      setBannerValidationError("Banner message is required.");
      return;
    }

    if (trimmedMessage.length > MAX_BANNER_TEXT_LENGTH) {
      setBannerValidationError(`Banner message must be at most ${MAX_BANNER_TEXT_LENGTH} characters.`);
      return;
    }

    if (!publishNow && !bannerStartAt.trim()) {
      setBannerValidationError("Choose publish now or provide a start time.");
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
          startAt: publishNow ? null : bannerStartAt,
          severity: bannerSeverity,
          enabled: bannerEnabled,
        }),
      });

      const result = (await response.json()) as { success?: boolean; error?: string };

      if (response.status === 401) {
        setIsAuthenticated(false);
        setBannerStatus("Your admin session expired. Please sign in again.");
        return;
      }

      if (!response.ok || !result.success) {
        const message = result.error || "Unable to save banner";
        setBannerStatus(message);
        toast.error(message);
        return;
      }

      setBannerStatus("Banner saved.");
      toast.success("Banner saved");
    } finally {
      setIsSavingBanner(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-5 text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-4xl font-semibold">Admin</h1>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeSwitcher game={themeState} setGame={setThemeState} send={() => {}} />
            <HelpButton doc="/help" />
          </div>
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
                disabled={isLoggingIn || isCheckingSession || isAuthenticated}
              />
            </div>
            <button
              type="submit"
              disabled={isLoggingIn || isCheckingSession || isAuthenticated}
              className="rounded-md bg-success-300 px-6 py-3 text-xl uppercase text-foreground shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingIn ? "Signing in..." : "Sign in"}
            </button>
          </form>
          {authError && <p className="mt-3 text-sm text-failure-500">{authError}</p>}
        </section>

        {!isCheckingSession && isAuthenticated && (
          <>
            <section className="rounded-xl border-2 border-secondary-600 bg-secondary-300 p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold">Maintenance Actions</h2>
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
                <button className="rounded-md bg-primary-200 p-3 text-left text-lg text-foreground shadow-sm hover:shadow-md">Refresh game cache</button>
                <button className="rounded-md bg-primary-200 p-3 text-left text-lg text-foreground shadow-sm hover:shadow-md">Reconnect active rooms</button>
                <button className="rounded-md bg-warning-200 p-3 text-left text-lg text-foreground shadow-sm hover:shadow-md">Pause new room creation</button>
                <button className="rounded-md bg-failure-200 p-3 text-left text-lg text-foreground shadow-sm hover:shadow-md">End all active sessions</button>
              </div>
            </section>

            <section className="rounded-xl border-2 border-secondary-600 bg-secondary-300 p-6">
              <h2 className="mb-4 text-2xl font-semibold">Launch announcement banner</h2>
              <form className="flex flex-col gap-4" onSubmit={saveBanner}>
                <div className="flex flex-col gap-2">
                  <label htmlFor="bannerMessage" className="text-lg">Banner message</label>
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
                  <input type="checkbox" checked={bannerEnabled} onChange={(event) => setBannerEnabled(event.target.checked)} className="h-5 w-5" disabled={isSavingBanner} />
                  Enable banner
                </label>
                <label className="flex items-center gap-2 text-lg">
                  <input type="checkbox" checked={publishNow} onChange={(event) => setPublishNow(event.target.checked)} className="h-5 w-5" disabled={isSavingBanner} />
                  Publish now
                </label>
                {!publishNow && (
                  <div className="flex flex-col gap-2">
                    <label htmlFor="bannerStartAt" className="text-lg">Start time</label>
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
                  <button type="submit" disabled={isSavingBanner} className="rounded-md bg-success-300 px-5 py-2 text-lg text-foreground shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60">
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
