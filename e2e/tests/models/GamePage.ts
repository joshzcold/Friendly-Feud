import { Locator, Page } from "@playwright/test";

class GamePage {
  page: Page;
  answers: {
    answered: Locator;
    unanswered: Locator;
  }[];
  finalRound: {
    points: Locator[];
    answers: Locator[][];
  };
  roomCodeText: Locator;
  roundMultiplyText: Locator;
  roundPointsTeam1: Locator;
  roundPointsTeam2: Locator;
  roundPointsTeamtotal: Locator;
  roundQuestionText: Locator;
  teamNames: Locator;
  getTeamNameByIndex: (index: number) => Locator;
  titleLogoImg: Locator;
  titleLogoUserUploaded: Locator;
  waitingForHostText: Locator;
  xImg: Locator;
  team0MistakesList: Locator;
  team1MistakesList: Locator;
  finalRoundTimerLabel: Locator;
  finalRoundTimerValue: Locator;
  quitButton: Locator;

  /**
   * @param {import('playwright').Page} page
   */
  constructor(page: Page) {
    this.page = page;

    this.answers = Array.from({ length: 9 }, (i) => ({
      answered: page.getByTestId(`answer${i}Answered`),
      unanswered: page.getByTestId(`answer${i}UnAnswered`),
    }));

    this.finalRound = {
      points: [page.getByTestId("finalRound0PointsTotalText"), page.getByTestId("finalRound1PointsTotalText")],
      answers: [
        Array.from({ length: 6 }, (_, i) => page.getByTestId(`finalRound1Answer${i}Text`)),
        Array.from({ length: 6 }, (_, i) => page.getByTestId(`finalRound2Answer${i}Text`)),
      ],
    };

    this.roomCodeText = page.getByTestId("roomCodeText");
    this.roundMultiplyText = page.getByTestId("roundMultiplyText");
    this.roundPointsTeam1 = page.getByTestId("roundPointsTeam1");
    this.roundPointsTeam2 = page.getByTestId("roundPointsTeam2");
    this.roundPointsTeamtotal = page.getByTestId("roundPointsTeamtotal");
    this.roundQuestionText = page.getByTestId("roundQuestionText");
    this.teamNames = page.getByTestId("team-name");
    this.getTeamNameByIndex = (index) => this.teamNames.nth(index);
    this.titleLogoImg = page.getByTestId("titleLogoImg");
    this.titleLogoUserUploaded = page.getByTestId("titleLogoUserUploaded");
    this.waitingForHostText = page.getByTestId("waitingForHostText");
    this.xImg = page.getByTestId("xImg");
    this.team0MistakesList = page.getByTestId("team0MistakesList");
    this.team1MistakesList = page.getByTestId("team1MistakesList");
    this.roundPointsTeam1 = page.getByTestId("roundPointsTeam1");
    this.roundPointsTeam2 = page.getByTestId("roundPointsTeam2");
    this.roundPointsTeamtotal = page.getByTestId("roundPointsTeamtotal");
    this.finalRoundTimerLabel = page.getByTestId("finalRoundTimerLabel");
    this.finalRoundTimerValue = page.getByTestId("finalRoundTimerValue");
    this.quitButton = page.getByTestId("quitButton");
  }

  async getTeamName(index: number) {
    return this.getTeamNameByIndex(index);
  }
}

export { GamePage };
