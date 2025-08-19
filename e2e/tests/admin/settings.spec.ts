import { expect, test } from "@playwright/test";
import type { Browser } from "@playwright/test";
import { PlayerType, Setup } from "../lib/Setup.js";
import { AdminPage } from "../models/AdminPage.js";
import { GamePage } from "../models/GamePage.js";

let s: Setup;
let host: Awaited<ReturnType<Setup["host"]>>;
let adminPage: AdminPage;
let spectator: Awaited<ReturnType<Setup["addPlayer"]>>;

test.beforeAll(async ({ browser }) => {
  s = new Setup(browser);
  host = await s.host();
  adminPage = new AdminPage(host.page);
  spectator = await s.addPlayer(PlayerType.SPECTATOR);

  await adminPage.gameSelector.selectOption({ index: 1 });
});

test("can edit title text", async ({ browser }: { browser: Browser }) => {
  const gamePage = new GamePage(spectator.page);

  await adminPage.titleTextInput.fill("New Game Title");
  await expect(gamePage.titleLogoImg).toContainText("New Game Title");
});

test("can edit first team name text", async ({ browser }: { browser: Browser }) => {
  const gamePage = new GamePage(spectator.page);

  await adminPage.teamOneNameInput.fill("Team Alpha");
  await expect(gamePage.getTeamNameByIndex(0)).toHaveText("Team Alpha");
});

test("can edit second team name text", async ({ browser }: { browser: Browser }) => {
  const gamePage = new GamePage(spectator.page);

  await adminPage.teamTwoNameInput.fill("Team Beta");
  await expect(gamePage.getTeamNameByIndex(1)).toHaveText("Team Beta");
});

test("can switch themes", async ({ browser }: { browser: Browser }) => {
  const themeChanged = spectator.page.waitForFunction(() => document.body.classList.contains("darkTheme"), {
    timeout: 10000,
  });
  await adminPage.themeSwitcherInput.selectOption({ index: 1 });
  await themeChanged;
  await expect(spectator.page.locator("body")).toHaveClass("darkTheme bg-background");
});

test("can hide questions", async ({ browser }: { browser: Browser }) => {
  const gamePage = new GamePage(spectator.page);

  await adminPage.startRoundOneButton.click();
  await adminPage.hideQuestionsInput.click();
  await expect(gamePage.roundQuestionText).toBeVisible();
});
