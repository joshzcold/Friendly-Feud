// @ts-check
import { expect, test } from "@playwright/test";
import { PlayerType, Setup } from "./lib/Setup.js";
import { AdminPage } from "./models/AdminPage.js";
import { HostBuzzerPage } from "./models/HostBuzzerPage.js";

test.describe("Buzzers screen on seperate browser.", () => {
  let buzzersPage: HostBuzzerPage;
  let adminPage: AdminPage;
  test.beforeAll(async ({ browser }) => {
    const s = new Setup(browser);
    const host = await s.host();
    const buzzers = await s.addPlayer(PlayerType.HOST_BUZZER);
    buzzersPage = new HostBuzzerPage(buzzers.page);
    adminPage = new AdminPage(host.page);

    await adminPage.teamOneNameInput.fill("Alpha");
    await adminPage.teamTwoNameInput.fill("Beta");
    await adminPage.gameSelector.selectOption({ index: 1 });
    await adminPage.startRoundOneButton.click();

    const hostPassword = await adminPage.hostPassword.innerText();
    buzzersPage.buzzersPasswordInput.fill(hostPassword);
    buzzersPage.buzzersSubmitButton.click();
    // Wait for host buzzers screen to be ready
    await expect(buzzersPage.buzzerButtons[0].button).toBeVisible({ timeout: 10000 });
  });

  test.afterEach(async ({}) => {
    // Clear only if there is something to clear; otherwise fallback to disabled state
    const canClear = await adminPage.clearBuzzersButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (canClear) {
      await adminPage.clearBuzzersButton.click();
      await expect(buzzersPage.buzzersInfo).not.toBeVisible({ timeout: 10000 });
    } else {
      await expect(adminPage.clearBuzzersButtonDisabled).toBeVisible({ timeout: 5000 });
    }
  });

  test("can use host buzzers touch screen", async () => {
    await buzzersPage.page.click("body");
    await buzzersPage.buzzerButtons[0].button.click();
    await expect(buzzersPage.buzzersInfo).toBeVisible({ timeout: 10000 });
    await expect(buzzersPage.buzzersInfo).toContainText("Team Alpha", { timeout: 10000 });
  });

  test("can use host buzzers keyboard k", async () => {
    await buzzersPage.page.click("body");
    await buzzersPage.page.keyboard.press("k");
    await expect(buzzersPage.buzzersInfo).toBeVisible({ timeout: 10000 });
    await expect(buzzersPage.buzzersInfo).toContainText("Team Beta", { timeout: 10000 });
  });

  test("can use host buzzers keyboard j", async () => {
    await buzzersPage.page.click("body");
    await buzzersPage.page.keyboard.press("j");
    await expect(buzzersPage.buzzersInfo).toBeVisible({ timeout: 10000 });
    await expect(buzzersPage.buzzersInfo).toContainText("Team Alpha", { timeout: 10000 });
  });
});
