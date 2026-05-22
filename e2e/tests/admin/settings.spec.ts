import path from "node:path";
import { expect, test } from "@playwright/test";
import { PlayerType, Setup } from "../lib/Setup.js";
import { AdminPage } from "../models/AdminPage.js";
import { GamePage } from "../models/GamePage.js";

const titleMusicFixturePath = path.resolve(process.cwd(), "../public/wrong.mp3");

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

test("can edit title text", async () => {
  const gamePage = new GamePage(spectator.page);

  await adminPage.titleTextInput.fill("New Game Title");
  await expect(gamePage.titleLogoImg).toContainText("New Game Title");
});

test("can edit first team name text", async () => {
  const gamePage = new GamePage(spectator.page);

  await adminPage.teamOneNameInput.fill("Alpha");
  await expect(gamePage.getTeamNameByIndex(0)).toHaveText("Alpha");
});

test("can edit second team name text", async () => {
  const gamePage = new GamePage(spectator.page);

  await adminPage.teamTwoNameInput.fill("Beta");
  await expect(gamePage.getTeamNameByIndex(1)).toHaveText("Beta");
});

test("can switch themes", async () => {
  const themeChanged = spectator.page.waitForFunction(() => document.body.classList.contains("darkTheme"), {
    timeout: 10000,
  });
  await adminPage.themeSwitcherInput.selectOption({ index: 1 });
  await themeChanged;
  await expect(spectator.page.locator("body")).toHaveClass("darkTheme bg-background game-screen");
});

test("can hide questions", async () => {
  const gamePage = new GamePage(spectator.page);

  await adminPage.startRoundOneButton.click();
  await adminPage.hideQuestionsInput.click();
  await expect(gamePage.roundQuestionText).toBeVisible();
});

test("can keep default title music and upload custom title music", async () => {
  await expect(adminPage.uploadTitleMusicButton).toHaveText("Upload Music");

  const defaultTitleMusicRequest = spectator.page.waitForRequest("**/title.mp3");
  await adminPage.playTitleMusicButton.click();
  await defaultTitleMusicRequest;
  await adminPage.pauseTitleMusicButton.click();

  await adminPage.titleMusicUpload.setInputFiles(titleMusicFixturePath);
  const titleMusicRequest = spectator.page.waitForRequest("**/api/rooms/*/title-music");
  await adminPage.playTitleMusicButton.click();
  await titleMusicRequest;
});
