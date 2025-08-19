import { Locator, Page } from "@playwright/test";

class AdminPage {
  page: Page;
  csv: {
    cancelUpload: Locator;
    errorText: Locator;
    submit: Locator;
    submitDisabled: Locator;
    finalRoundTimers: {
      first: Locator;
      second: Locator;
    };
    settings: {
      finalRoundCount: Locator;
      noHeader: Locator;
      roundCount: Locator;
    };
    rows: Locator[];
  };
  finalRound: {
    button: Locator;
    title: Locator;
    titleInput: Locator;
    timerLabel: Locator;
    timerValue: Locator;
    answers: {
      input: Locator;
      reveal: Locator;
      selector: Locator;
      submit: Locator;
    }[];
  };
  players: {
    buzzed: {
      teamName: Locator;
      name: Locator;
      time: Locator;
    }[];
    teamQuitButtons: {
      team1: Locator[];
      team2: Locator[];
    };
    hideGameButtons: {
      team1: Locator[];
      team2: Locator[];
    };
  };
  questions: Locator[];
  backToRound1FinalButton: Locator;
  clearBuzzersButton: Locator;
  clearBuzzersButtonDisabled: Locator;
  createNewGameButton: Locator;
  currentRoundQuestionText: Locator;
  currentScreenText: Locator;
  deleteLogoButton: Locator;
  errorText: Locator;
  finalRoundNumberText: Locator;
  finalRoundTotalPointsText: Locator;
  finalRoundWinText: Locator;
  gamePickerFileUpload: Locator;
  gameSelector: Locator;
  hideFirstRoundAnswersButton: Locator;
  hideQuestionsInput: Locator;
  logoUpload: Locator;
  multiplierInput: Locator;
  multiplierText: Locator;
  nextRoundButton: Locator;
  openGameWindowButton: Locator;
  pointsNumberText: Locator;
  pointsText: Locator;
  quitButton: Locator;
  resetMistakesButton: Locator;
  revealFirstRoundFinalButton: Locator;
  roomCodeText: Locator;
  roundSelector: Locator;
  showMistakeButton: Locator;
  startFinalRound2Button: Locator;
  startRoundOneButton: Locator;
  startTimerButton: Locator;
  resetTimerButton: Locator;
  stopTimerButton: Locator;
  teamOneNameInput: Locator;
  teamOnePointsInput: Locator;
  teamTwoNameInput: Locator;
  teamTwoPointsInput: Locator;
  themeSwitcherInput: Locator;
  titleCardButton: Locator;
  titleTextInput: Locator;
  team0MistakeButton: Locator;
  team1MistakeButton: Locator;
  team0GivePointsButton: Locator;
  team1GivePointsButton: Locator;
  hostPassword: Locator;

  /**
   * @param {import('playwright').Page} page
   */
  // prettier-ignore
  constructor(page: Page) {
    this.page = page;

    this.csv = {
      cancelUpload: page.getByTestId("csvCancelUploadButton"),
      errorText: page.getByTestId("csvErrorText"),
      submit: page.getByTestId("csvFileUploadSubmitButton"),
      submitDisabled: page.getByTestId("csvFileUploadSubmitButtonDisabled"),
      finalRoundTimers: {
        first: page.getByTestId("csvFinalRoundTimerInput"),
        second: page.getByTestId("csvFinalRound2ndTimerInput")
      },
      settings: {
        finalRoundCount: page.getByTestId("csvSetFinalRoundCountInput"),
        noHeader: page.getByTestId("csvSetNoHeaderInput"),
        roundCount: page.getByTestId("csvSetRoundCountInput")
      },
      rows: Array.from({ length: 8 }, (_, i) => page.getByTestId(`csvRow${i}`))
    };

    this.finalRound = {
      button: page.getByTestId("finalRoundButton"),
      title: page.getByTestId("finalRoundTitle"),
      titleInput: page.getByTestId("finalRoundTitleChangerInput"),
      timerLabel: page.getByTestId("finalRoundTimerLabel"),
      timerValue: page.getByTestId("finalRoundTimerValue"),
      answers: Array.from({ length: 10 }, (_, i) => ({
        input: page.getByTestId(`finalRoundAnswer${i}Input`),
        reveal: page.getByTestId(`finalRoundAnswer${i}RevealButton`),
        selector: page.getByTestId(`finalRoundAnswer${i}Selector`),
        submit: page.getByTestId(`finalRoundAnswers${i}SubmitButton`)
      }))
    };

    this.players = {
      buzzed: Array.from({ length: 5 }, (_, i) => ({
        teamName: page.getByTestId(`playerBuzzed${i}TeamNameText`),
        name: page.getByTestId(`playerBuzzed${i}NameText`),
        time: page.getByTestId(`playerBuzzed${i}BuzzerTimeText`)
      })),
      teamQuitButtons: {
        team1: Array.from({ length: 4 }, (_, i) => page.getByTestId(`player${i}Team1QuitButton`)),
        team2: Array.from({ length: 4 }, (_, i) => page.getByTestId(`player${i}Team2QuitButton`))
      },
      hideGameButtons: {
        team1: Array.from({ length: 4 }, (_, i) => page.getByTestId(`player${i}Team1HideGameButton`)),
        team2: Array.from({ length: 4 }, (_, i) => page.getByTestId(`player${i}Team2HideGameButton`))
      }
    };

    this.questions = Array.from({ length: 10 }, (_, i) =>
      page.getByTestId(`question${i}Button`)
    );

    this.backToRound1FinalButton = page.getByTestId("backToRound1FinalButton");
    this.clearBuzzersButton = page.getByTestId("clearBuzzersButton");
    this.clearBuzzersButtonDisabled = page.getByTestId("clearBuzzersButtonDisabled");
    this.createNewGameButton = page.getByTestId("createNewGameButton");
    this.currentRoundQuestionText = page.getByTestId("currentRoundQuestionText");
    this.currentScreenText = page.getByTestId("currentScreenText");
    this.deleteLogoButton = page.getByTestId("deleteLogoButton");
    this.errorText = page.getByTestId("errorText");
    this.finalRoundNumberText = page.getByTestId("finalRoundNumberText");
    this.finalRoundTotalPointsText = page.getByTestId("finalRoundTotalPointsText")
    this.finalRoundWinText = page.getByTestId("finalRoundWinText")
    this.gamePickerFileUpload = page.getByTestId("gamePickerFileUploadButton");
    this.gameSelector = page.getByTestId("gameSelector");
    this.hideFirstRoundAnswersButton = page.getByTestId("hideFirstRoundAnswersButton",);
    this.hideQuestionsInput = page.getByTestId("hideQuestionsInput")
    this.logoUpload = page.getByTestId("logoUpload");
    this.multiplierInput = page.getByTestId("multiplierInput");
    this.multiplierText = page.getByTestId("multiplierText");
    this.nextRoundButton = page.getByTestId("nextRoundButton");
    this.openGameWindowButton = page.getByTestId("openGameWindowButton");
    this.pointsNumberText = page.getByTestId("pointsNumberText");
    this.pointsText = page.getByTestId("pointsText");
    this.quitButton = page.getByTestId("quitButton");
    this.resetMistakesButton = page.getByTestId("resetMistakesButton");
    this.revealFirstRoundFinalButton = page.getByTestId("revealFirstRoundFinalButton",);
    this.roomCodeText = page.getByTestId("roomCodeText");
    this.roundSelector = page.getByTestId("roundSelector");
    this.showMistakeButton = page.getByTestId("showMistakeButton");
    this.startFinalRound2Button = page.getByTestId("startFinalRound2Button");
    this.startRoundOneButton = page.getByTestId("startRoundOneButton");
    this.startTimerButton = page.getByTestId("startTimerButton");
    this.resetTimerButton = page.getByTestId("resetTimerButton")
    this.stopTimerButton = page.getByTestId("stopTimerButton");
    this.teamOneNameInput = page.getByTestId("teamOneNameInput");
    this.teamOnePointsInput = page.getByTestId("teamOnePointsInput");
    this.teamTwoNameInput = page.getByTestId("teamTwoNameInput");
    this.teamTwoPointsInput = page.getByTestId("teamTwoPointsInput");
    this.themeSwitcherInput = page.getByTestId("themeSwitcherInput")
    this.titleCardButton = page.getByTestId("titleCardButton");
    this.titleTextInput = page.getByTestId("titleTextInput");

    this.team0MistakeButton = page.getByTestId("team0MistakeButton")
    this.team1MistakeButton = page.getByTestId("team1MistakeButton")
    this.team0GivePointsButton = page.getByTestId("team0GivePointsButton")
    this.team1GivePointsButton = page.getByTestId("team1GivePointsButton")
    this.hostPassword = page.getByTestId("hostPassword")
  }
}

export { AdminPage };
