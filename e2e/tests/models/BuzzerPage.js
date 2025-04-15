class BuzzerPage {
  /**
   * @param {import('playwright').Page} page
   */
  // prettier-ignore
  constructor(page) {
    this.page = page;

    this.answers = Array.from({length: 9}, (_, i) => ({
      answered: page.getByTestId(`answer${i}Answered`),
      unanswered: page.getByTestId(`answer${i}UnAnswered`)
    }));

    this.finalRound = {
      points: [
        page.getByTestId("finalRound0PointsTotalText"),
        page.getByTestId("finalRound1PointsTotalText")
      ],
      answers: [
        Array.from({length: 6}, (_, i) => page.getByTestId(`finalRound1Answer${i}Text`)),
        Array.from({length: 6}, (_, i) => page.getByTestId(`finalRound2Answer${i}Text`))
      ]
    };

    this.buzzerButton = page.getByTestId("buzzerButton");
    this.buzzerButtonPressed = page.getByTestId("buzzerButtonPressed");
    this.joinTeam1 = page.getByTestId("joinTeam1");
    this.joinTeam2 = page.getByTestId("joinTeam2");
    this.loadingText = page.getByTestId("loadingText");
    this.openGameWindowButton = page.getByTestId("openGameWindowButton");
    this.quitButton = page.getByTestId("quitButton");
    this.registerBuzzerButton = page.getByTestId("registerBuzzerButton");
    this.titleLogoImg = page.getByTestId("titleLogoImg");
    this.titleLogoUserUploaded = page.getByTestId("titleLogoUserUploaded");
    this.waitingForHostText = page.getByTestId("waitingForHostText");
    this.xImg = page.getByTestId("xImg");
    this.playerBlindFoldedText = page.getByTestId("playerBlindFoldedText")
  }
}

export { BuzzerPage };
