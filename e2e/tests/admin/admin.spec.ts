import { PATHS } from "@/e2e/utils/constants";
import { expect, test } from "@playwright/test";
import { PlayerType, Setup } from "../lib/Setup";
import { AdminPage } from "../models/AdminPage";
import { BuzzerPage } from "../models/BuzzerPage";
import { GamePage } from "../models/GamePage";

let s: Setup;
let host: Awaited<ReturnType<Setup["host"]>>;
let adminPage: AdminPage;

test.beforeEach(async ({ browser }) => {
  s = new Setup(browser);
  host = await s.host();
  adminPage = new AdminPage(host.page);
});

test("has correct room code", async ({ browser, baseURL }) => {
  const gamePage = new GamePage(host.page);
  const gameUrl = await adminPage.openGameWindowButton.getAttribute("href");
  await host.page.goto(gameUrl as string);
  expect(host.page.url()).toEqual(baseURL + "/game");
  expect(await gamePage.roomCodeText.innerText()).toEqual(s.roomCode);
});

test("can join game", async ({ }) => {
  const player = await s.addPlayer();
  const buzzerPagePlayer = new BuzzerPage(player.page);
  expect(buzzerPagePlayer.titleLogoImg).toBeVisible();
  expect(await buzzerPagePlayer.waitingForHostText.innerText()).toEqual("Waiting for host to start");
});

test("can pick game", async ({ }) => {
  const player = await s.addPlayer();
  await adminPage.gameSelector.selectOption({ index: 1 });
  await adminPage.startRoundOneButton.click();
  const buzzerPage = new BuzzerPage(player.page);
  await expect(buzzerPage.answers[0].unanswered).toBeVisible();
});

test("can select final round answers", async ({ }) => {
  const player = await s.addPlayer();
  const fileChooserPromise = host.page.waitForEvent("filechooser");
  await adminPage.gamePickerFileUpload.click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(PATHS.GAME_JSON);
  await adminPage.startRoundOneButton.click();
  const buzzerPage = new BuzzerPage(player.page);
  await adminPage.finalRound.button.click();

  await adminPage.finalRound.answers[0].input.fill("test 1");
  await adminPage.finalRound.answers[0].selector.selectOption({ index: 1 });
  await adminPage.finalRound.answers[0].reveal.click();
  await adminPage.finalRound.answers[0].submit.click();

  await adminPage.finalRound.answers[1].input.fill("test 2");
  await adminPage.finalRound.answers[1].selector.selectOption({ index: 1 });
  await adminPage.finalRound.answers[1].reveal.click();
  await adminPage.finalRound.answers[1].submit.click();

  await expect(async () => {
    expect(await buzzerPage.finalRound.answers[0][0].innerText()).toBe("TEST 1");
    expect(await buzzerPage.finalRound.answers[0][1].innerText()).toBe("TEST 2");
  }).toPass({ timeout: 5000 });

  await adminPage.startFinalRound2Button.click();

  await adminPage.finalRound.answers[1].input.fill("test 3");
  await adminPage.finalRound.answers[1].selector.selectOption({ index: 1 });
  await adminPage.finalRound.answers[1].reveal.click();
  await adminPage.finalRound.answers[1].submit.click();

  await adminPage.revealFirstRoundFinalButton.click();

  await expect(async () => {
    expect(await buzzerPage.finalRound.answers[0][0].innerText()).toBe("TEST 1");
    expect(await buzzerPage.finalRound.answers[0][1].innerText()).toBe("TEST 2");
    expect(await buzzerPage.finalRound.answers[1][1].innerText()).toBe("TEST 3");
  }).toPass({ timeout: 5000 });
});

test("can hide game board from player", async ({ }) => {
  const player1 = await s.addPlayer();
  const buzzerPage1 = new BuzzerPage(player1.page);

  await adminPage.gameSelector.selectOption({ index: 1 });
  await adminPage.startRoundOneButton.click({ timeout: 2000 });
  await expect(buzzerPage1.playerBlindFoldedText).not.toBeVisible({ timeout: 2000 });
  await adminPage.players.hideGameButtons.team1[0].click({ timeout: 2000 });
  await expect(buzzerPage1.playerBlindFoldedText).toBeVisible({ timeout: 2000 });
});

test("can answer final round questions", async ({ }) => {
  const spectator = await s.addPlayer(PlayerType.SPECTATOR);
  const gamePage = new GamePage(spectator.page);

  await adminPage.gameSelector.selectOption({ index: 1 });
  await adminPage.finalRound.button.click();

  await adminPage.finalRound.answers[0].input.fill("Answer One");
  await adminPage.finalRound.answers[0].selector.selectOption({ index: 1 });

  await expect(async () => {
    const finalRound0Text = await adminPage.page.$eval(
      "#finalRoundAnswer0Selector",
      (sel: HTMLSelectElement) => sel.options[sel.options.selectedIndex].textContent
    );
    const finalRound0PointsValue = parseInt(finalRound0Text!.replace(/^\D+/g, ""));
    await adminPage.finalRound.answers[0].reveal.click();
    await adminPage.finalRound.answers[0].submit.click();

    await expect(gamePage.finalRound.answers[0][0]).toBeVisible();
    await expect(gamePage.finalRound.points[1]).toBeVisible();
    expect(await gamePage.finalRound.points[1].textContent()).toBe(finalRound0PointsValue.toString());
  }).toPass({ timeout: 5000 });
});

test("quit button should quit game and return to home page", async ({ }) => {
  await host.page.goto("/");
  await adminPage.quitButton.click();
  await expect(host.page).toHaveURL("/");
});
