import { PATHS } from "@/e2e/utils/constants";
import { expect, test } from "@playwright/test";
import { PlayerType, Setup } from "../lib/Setup";
import { AdminPage } from "../models/AdminPage";
import { GamePage } from "../models/GamePage";

let s: Setup;
let host: Awaited<ReturnType<Setup["host"]>>;
let adminPage: AdminPage;
let spectator: Awaited<ReturnType<Setup["addPlayer"]>>;
let gamePage: GamePage;

test.beforeEach(async ({ browser }) => {
  s = new Setup(browser);
  host = await s.host();
  adminPage = new AdminPage(host.page);
  spectator = await s.addPlayer(PlayerType.SPECTATOR);
  gamePage = new GamePage(spectator.page);

  const fileChooserPromise = host.page.waitForEvent("filechooser");
  await adminPage.gamePickerFileUpload.click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(PATHS.QUICK_GAME_JSON);

  await adminPage.finalRound.button.click();
});

test("initializes final round timer", async () => {
  await expect(gamePage.finalRoundTimerValue).not.toHaveText("0");
});

test("starts and decreases timer", async () => {
  await expect
    .poll(async () => {
      return parseInt(await gamePage.finalRoundTimerValue.innerText());
    })
    .toBeGreaterThan(0);
  const initialTimerNum = parseInt(await gamePage.finalRoundTimerValue.innerText());
  await adminPage.startTimerButton.click();
  await spectator.page.waitForTimeout(1000);

  const postStartTimerNum = parseInt(await gamePage.finalRoundTimerValue.innerText());
  expect(postStartTimerNum).toBeLessThan(initialTimerNum);
});

test("stops timer", async () => {
  await adminPage.startTimerButton.click();
  await spectator.page.waitForTimeout(1000);
  await adminPage.stopTimerButton.click();

  const stoppedTimerNum = parseInt(await gamePage.finalRoundTimerValue.innerText());
  await spectator.page.waitForTimeout(1000);
  const postStopTimerNum = parseInt(await gamePage.finalRoundTimerValue.innerText());

  expect(postStopTimerNum).toBe(stoppedTimerNum);
});

test("emits completion event when timer reaches zero", async () => {
  await expect(gamePage.finalRoundTimerValue).not.toHaveText("0");
  await adminPage.startTimerButton.click();
  await expect(gamePage.finalRoundTimerValue).toHaveText("0", { timeout: 3000 });

  await expect(adminPage.startTimerButton).toBeDisabled();
  await expect(adminPage.resetTimerButton).toBeEnabled();
  await expect(adminPage.startFinalRound2Button).toBeEnabled();
});

test("toggles button states correctly", async () => {
  // Initial state
  await expect(adminPage.startTimerButton).toBeEnabled();
  await expect(adminPage.resetTimerButton).toBeEnabled();
  await expect(adminPage.startFinalRound2Button).toBeEnabled();

  // During running
  await adminPage.startTimerButton.click();
  await expect(adminPage.stopTimerButton).toBeEnabled();
  await expect(adminPage.resetTimerButton).toBeDisabled();
  await expect(adminPage.startFinalRound2Button).toBeDisabled();

  // After stop
  await adminPage.stopTimerButton.click();
  await expect(adminPage.startTimerButton).toBeEnabled();
  await expect(adminPage.resetTimerButton).toBeEnabled();
  await expect(adminPage.startFinalRound2Button).toBeEnabled();
});

test("resets timer", async () => {
  await expect(gamePage.finalRoundTimerValue).not.toHaveText("0");
  const initialTimerNum = parseInt(await gamePage.finalRoundTimerValue.innerText());

  await adminPage.startTimerButton.click();
  await spectator.page.waitForTimeout(1000);
  await adminPage.stopTimerButton.click();
  await adminPage.resetTimerButton.click();

  await expect
    .poll(async () => {
      return parseInt(await gamePage.finalRoundTimerValue.innerText());
    })
    .toBe(initialTimerNum);
});
