import { PATHS } from "@/e2e/utils/constants";
import { expect, test } from "@playwright/test";
import { Setup } from "../lib/Setup";
import { AdminPage } from "../models/AdminPage";
import { BuzzerPage } from "../models/BuzzerPage";

let s: Setup;
let host: Awaited<ReturnType<Setup["host"]>>;
let adminPage: AdminPage;

test.beforeEach(async ({ browser }) => {
  s = new Setup(browser);
  host = await s.host();
  adminPage = new AdminPage(host.page);
});

test("can upload json game", async () => {
  const player = await s.addPlayer();

  await uploadGameFile(PATHS.GAME_JSON);

  await adminPage.startRoundOneButton.click();
  const buzzerPage = new BuzzerPage(player.page);

  await expect(buzzerPage.answers[0].unanswered).toBeVisible();
  await adminPage.questions[0].click();
  await expect(buzzerPage.answers[0].answered).toBeVisible();
  await expect(adminPage.currentRoundQuestionText).toHaveText("Name Something That People Could Watch For Hours.");
});

test("can upload csv game", async () => {
  await uploadGameFile(PATHS.GAME_CSV);

  expect(adminPage.csv.errorText).not.toBeVisible();

  await test.step("configure csv settings", async () => {
    await adminPage.csv.settings.noHeader.click();
    expect(adminPage.csv.errorText).toBeVisible();
    await adminPage.csv.settings.noHeader.click();

    await adminPage.csv.settings.roundCount.fill("5");
    await adminPage.csv.finalRoundTimers.first.fill("15");
    await adminPage.csv.finalRoundTimers.second.fill("20");
  });

  await adminPage.csv.submit.click();
  await adminPage.startRoundOneButton.click();

  await expect(adminPage.currentRoundQuestionText).toHaveText(
    "We Asked 100 Moms: On A Scale From 1-10, How Much Have You Become Like Your Own Mom With Age?"
  );
});

async function uploadGameFile(filePath: string) {
  const fileChooserPromise = host.page.waitForEvent("filechooser");
  await adminPage.gamePickerFileUpload.click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(filePath);
}
