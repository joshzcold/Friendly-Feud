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

    await adminPage.teamOneNameInput.fill("Team Alpha");
    await adminPage.teamTwoNameInput.fill("Team Beta");
    await adminPage.gameSelector.selectOption({ index: 1 });
    await adminPage.startRoundOneButton.click();

    const hostPassword = await adminPage.hostPassword.innerText();
    buzzersPage.buzzersPasswordInput.fill(hostPassword);
    buzzersPage.buzzersSubmitButton.click();
  });

  test.afterEach(async ({}) => {
    await adminPage.clearBuzzersButton.click({ timeout: 5000 });
    await expect(buzzersPage.buzzersInfo).not.toBeVisible({ timeout: 5000 });
  });

  test("can use host buzzers touch screen", async () => {
    await buzzersPage.buzzerButtons[0].button.click();
    await buzzersPage.buzzersInfo.isVisible();
    expect(buzzersPage.buzzersInfo).toContainText("Team Alpha", { timeout: 5000 });
  });

  test("can use host buzzers keyboard k", async () => {
    await buzzersPage.page.keyboard.type("k");
    await buzzersPage.buzzersInfo.isVisible();
    expect(buzzersPage.buzzersInfo).toContainText("Team Beta", { timeout: 5000 });
  });

  test("can use host buzzers keyboard j", async () => {
    await buzzersPage.page.keyboard.type("j");
    await buzzersPage.buzzersInfo.isVisible();
    expect(buzzersPage.buzzersInfo).toContainText("Team Alpha", { timeout: 5000 });
  });
});
