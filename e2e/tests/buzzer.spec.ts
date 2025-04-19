// @ts-check
import { expect, test } from "@playwright/test";
import { Setup } from "./lib/Setup.js";
import { AdminPage } from "./models/AdminPage.js";
import { BuzzerPage } from "./models/BuzzerPage.js";

test("can use buzzers", async ({ browser }) => {
  const s = new Setup(browser);
  const host = await s.host();
  const player1 = await s.addPlayer();
  const buzzerPage1 = new BuzzerPage(player1.page);

  const player2 = await s.addPlayer();
  const buzzerPage2 = new BuzzerPage(player2.page);

  const player3 = await s.addPlayer();
  const buzzerPage3 = new BuzzerPage(player3.page);

  const adminPage = new AdminPage(host.page);
  await adminPage.gameSelector.selectOption({ index: 1 });
  await adminPage.startRoundOneButton.click();

  await buzzerPage1.buzzerButton.click();
  await buzzerPage2.buzzerButton.click();
  await buzzerPage3.buzzerButton.click();

  await expect(adminPage.players.buzzed[0].name).toContainText(player1.name);
  await expect(adminPage.players.buzzed[1].name).toContainText(player2.name);
  await expect(adminPage.players.buzzed[2].name).toContainText(player3.name);

  await adminPage.clearBuzzersButton.click();

  await expect(adminPage.players.buzzed[0].name).not.toBeVisible();
  await expect(adminPage.players.buzzed[1].name).not.toBeVisible();
  await expect(adminPage.players.buzzed[2].name).not.toBeVisible();

  await buzzerPage1.buzzerButton.click();
  await buzzerPage2.buzzerButton.click();
  await buzzerPage3.buzzerButton.click();

  await adminPage.players.teamQuitButtons.team1[0].click();
  await adminPage.players.teamQuitButtons.team2[0].click();
  // players shifted after first 1 quit
  await adminPage.players.teamQuitButtons.team1[0].click();

  await expect(adminPage.players.buzzed[0].name).not.toBeVisible();
  await expect(adminPage.players.buzzed[1].name).not.toBeVisible();
  await expect(adminPage.players.buzzed[2].name).not.toBeVisible();
});

test("quit game should return to home page", async ({ browser }) => {
  const s = new Setup(browser);
  const host = await s.host();
  const buzzerPage = new BuzzerPage(host.page);
  await buzzerPage.quitButton.click();
  await expect(host.page).toHaveURL("/");
});
