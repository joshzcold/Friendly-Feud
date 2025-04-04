class NewGamePage {
  /**
   * @param {import('playwright').Page} page
   */

  // prettier-ignore
  constructor(page) {
    this.page = page;

    this.errorText = page.getByTestId("errorText")

    this.finalRound = {
      timer: {
        inputs: [
          page.getByTestId("finalRound1TimerInput"),
          page.getByTestId("finalRound2TimerInput")
        ],
        texts: [
          page.getByTestId("finalRound1TimerText"),
          page.getByTestId("finalRound2TimerText")
        ]
      },
      addQuestionButton: page.getByTestId("finalRoundAddQuestionButton"),
      questions: Array.from({length: 7}, (_, q) => ({
        input: page.getByTestId(`finalRoundQuestion${q}Input`),
        addAnswerButton: page.getByTestId(`finalRoundQuestion${q}AddAnswerButton`),
        removeAnswerButton: page.getByTestId(`finalRoundQuestion${q}RemoveAnswerButton`),
        removeQuestionButton: page.getByTestId(`finalRoundQuestion${q}RemoveQuestionButton`),
        answers: Array.from({length: 6}, (_, a) => ({
          input: page.getByTestId(`finalRoundQuestion${q}Answer${a}Input`),
          points: page.getByTestId(`finalRoundQuestion${q}AnswerPoints${a}Input`)
        }))
      }))
    };

    this.rounds = Array.from({length: 6}, (_, r) => ({
      questionInput: page.getByTestId(`round${r}QuestionInput`),
      multiplierInput: page.getByTestId(`round${r}QuestionMultiplierInput`),
      addAnswerButton: page.getByTestId(`round${r}AnswerAddButton`),
      removeAnswerButton: page.getByTestId(`round${r}AnswerRemoveButton`),
      answers: Array.from({length: 6}, (_, a) => ({
        nameInput: page.getByTestId(`round${r}Answer${a}NameInput`),
        pointsInput: page.getByTestId(`round${r}Answer${a}PointsInput`),
        removeButton: page.getByTestId(`round${r}Answer${a}RemoveButton`)
      }))
    }));

    this.gamePicker = page.getByTestId("gamePicker")
    this.gamePickerSubmitButton = page.getByTestId("gamePickerSubmitButton")
    this.newGameSubmitButton = page.getByTestId("newGameSubmitButton")
    this.roundAddButton = page.getByTestId("roundAddButton")
  }
}

export { NewGamePage };
