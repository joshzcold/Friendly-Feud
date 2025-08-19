import { expect, test } from "@playwright/test";
import { PlayerType, Setup } from "../lib/Setup";
import { AdminPage } from "../models/AdminPage";
import { GamePage } from "../models/GamePage";

let s: Setup;
let host: Awaited<ReturnType<Setup["host"]>>;
let adminPage: AdminPage;
let spectator: Awaited<ReturnType<Setup["addPlayer"]>>;

test.beforeEach(async ({ browser }) => {
  s = new Setup(browser);
  host = await s.host();
  adminPage = new AdminPage(host.page);
  spectator = await s.addPlayer(PlayerType.SPECTATOR);
});

test("can track points between rounds", async () => {
  const gamePage = new GamePage(spectator.page);

  await adminPage.gameSelector.selectOption({ index: 1 });
  await adminPage.startRoundOneButton.click();

  await adminPage.questions[0].click();
  await adminPage.questions[1].click();
  const points1Text = await adminPage.questions[0].innerText();
  const points2Text = await adminPage.questions[1].innerText();
  const points1 = parseInt(points1Text.replace(/^\D+/g, ""));
  const points2 = parseInt(points2Text.replace(/^\D+/g, ""));

  const pointsTotal = points1 + points2;

  await adminPage.team0GivePointsButton.click();
  await expect(async () => {
    expect(await gamePage.roundPointsTeam1.textContent()).toBe(pointsTotal.toString());
    expect(await gamePage.roundPointsTeamtotal.textContent()).toBe(pointsTotal.toString());
  }).toPass({ timeout: 2000 });

  await adminPage.nextRoundButton.click();
  await expect(async () => {
    expect(await gamePage.roundPointsTeam1.textContent()).toBe(pointsTotal.toString());
    expect(await gamePage.roundPointsTeamtotal.textContent()).toBe("0");
  }).toPass({ timeout: 2000 });

  const points1Text_2 = await adminPage.questions[0].innerText();
  const points2Text_2 = await adminPage.questions[1].innerText();
  const points1_2 = parseInt(points1Text_2.replace(/^\D+/g, ""));
  const points2_2 = parseInt(points2Text_2.replace(/^\D+/g, ""));
  const points2TotalPlusPrevious = points1_2 + points2_2 + pointsTotal;
  const points2Total = points1_2 + points2_2;
  await adminPage.questions[0].click();
  await adminPage.questions[1].click();
  await adminPage.team0GivePointsButton.click();
  await expect(async () => {
    expect(await gamePage.roundPointsTeam1.textContent()).toBe(points2TotalPlusPrevious.toString());
    expect(await gamePage.roundPointsTeamtotal.textContent()).toBe(points2Total.toString());
  }).toPass({ timeout: 2000 });
  await adminPage.roundSelector.selectOption({ index: 0 });

  await expect(async () => {
    expect(await gamePage.roundPointsTeam1.textContent()).toBe(points2TotalPlusPrevious.toString());
    expect(await gamePage.roundPointsTeamtotal.textContent()).toBe(pointsTotal.toString());
  }).toPass({ timeout: 2000 });
});

test("can see mistakes", async () => {
  const gamePage = new GamePage(spectator.page);

  await adminPage.gameSelector.selectOption({ index: 1 });
  await adminPage.startRoundOneButton.click();

  await adminPage.team0MistakeButton.click();
  await expect(gamePage.team0MistakesList.locator("div")).toHaveCount(1);
  await adminPage.team0MistakeButton.click();
  await expect(gamePage.team0MistakesList.locator("div")).toHaveCount(2);
  await adminPage.team1MistakeButton.click();
  await expect(gamePage.team1MistakesList.locator("div")).toHaveCount(1);
});
