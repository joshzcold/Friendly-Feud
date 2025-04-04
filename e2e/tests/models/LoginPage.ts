class LoginPage {
  /**
   * @param {import('playwright').Page} page
   */
  constructor(page) {
    this.page = page;
    this.roomCodeInput = page.getByTestId("roomCodeInput");
    this.playerNameInput = page.getByTestId("playerNameInput");
    this.joinRoomButton = page.getByTestId("joinRoomButton");
    this.hostRoomButton = page.getByTestId("hostRoomButton");
    this.errorText = page.getByTestId("errorText");
  }
}

export { LoginPage };
