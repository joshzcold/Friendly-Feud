// @ts-check
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { PATHS } from "../utils/constants.js";
import { Setup } from "./lib/Setup.js";
import { NewGamePage } from "./models/NewGamePage.js";

test("Can create new game", async ({ browser }) => {
  const s = new Setup(browser);
  const host = await s.host();
  await host.page.goto("/new");
  const newGamePage = new NewGamePage(host.page);

  await newGamePage.rounds[0].questionInput.fill("Question 1");
  await newGamePage.rounds[0].answers[0].nameInput.fill("Answer 1");
  await newGamePage.rounds[0].answers[0].pointsInput.fill("");
  await newGamePage.rounds[0].answers[0].pointsInput.fill("20");

  await newGamePage.finalRound.questions[0].input.fill("");
  await newGamePage.finalRound.questions[0].input.fill("Question 1");

  await newGamePage.finalRound.questions[0].addAnswerButton.click();

  await newGamePage.finalRound.questions[0].answers[0].input.fill("Answer 1");
  await newGamePage.finalRound.questions[0].answers[0].points.fill("");
  await newGamePage.finalRound.questions[0].answers[0].points.fill("10");

  await newGamePage.finalRound.questions[0].addAnswerButton.click();

  await newGamePage.finalRound.questions[0].answers[1].input.fill("Answer 2");
  await newGamePage.finalRound.questions[0].answers[1].points.fill("");
  await newGamePage.finalRound.questions[0].answers[1].points.fill("20");

  const downloadPromise = host.page.waitForEvent("download");
  await newGamePage.newGameSubmitButton.click();
  const download = await downloadPromise;

  // Wait for the download process to complete and save the downloaded file somewhere.
  await download.saveAs(PATHS.DOWNLOADED_GAME_JSON);
  const jsonData = await JSON.parse(readFileSync(PATHS.DOWNLOADED_GAME_JSON, "utf-8"));
  expect(jsonData.rounds[0].question).toBe("Question 1");
  expect(jsonData.rounds[0].answers[0].ans).toBe("Answer 1");
  expect(jsonData.final_round[0].question).toBe("Question 1");
  expect(jsonData.final_round[1].question).toBe("Question 2");
});

test("Can create new game upload existing game", async ({ browser }) => {
  const s = new Setup(browser);
  const host = await s.host();
  await host.page.goto("/new");
  const newGamePage = new NewGamePage(host.page);
  const fileChooserPromise = host.page.waitForEvent("filechooser");
  const gameFilePath = PATHS.GAME_JSON;
  await newGamePage.gamePicker.click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(gameFilePath);
  const jsonData = await JSON.parse(readFileSync(gameFilePath, "utf-8"));
  await newGamePage.gamePickerSubmitButton.click();
  await expect(async () => {
    expect(await newGamePage.rounds[0].questionInput.inputValue()).toBe(jsonData.rounds[0].question);
    expect(await newGamePage.rounds[1].questionInput.inputValue()).toBe(jsonData.rounds[1].question);
    expect(await newGamePage.rounds[2].questionInput.inputValue()).toBe(jsonData.rounds[2].question);
    expect(await newGamePage.rounds[3].questionInput.inputValue()).toBe(jsonData.rounds[3].question);
    expect(await newGamePage.rounds[4].questionInput.inputValue()).toBe(jsonData.rounds[4].question);

    expect(await newGamePage.rounds[5].questionInput.inputValue()).toBe(jsonData.rounds[5].question);

    expect(await newGamePage.rounds[5].answers[0].nameInput.inputValue()).toBe(
      jsonData.rounds[5].answers[0].ans.toString()
    );
    expect(await newGamePage.rounds[5].answers[0].pointsInput.inputValue()).toBe(
      jsonData.rounds[5].answers[0].pnt.toString()
    );

    expect(await newGamePage.finalRound.questions[0].input.inputValue()).toBe(jsonData.final_round[0].question);
    expect(await newGamePage.finalRound.questions[0].answers[0].input.inputValue()).toBe(
      jsonData.final_round[0].answers[0][0].toString()
    );
    expect(await newGamePage.finalRound.questions[0].answers[0].points.inputValue()).toBe(
      jsonData.final_round[0].answers[0][1].toString()
    );
  }).toPass();
});
