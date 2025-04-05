import { Locator, Page } from "@playwright/test";

class LoginPage {
  page: Page;
  roomCodeInput: Locator;
  playerNameInput: Locator;
  joinRoomButton: Locator;
  hostRoomButton: Locator;
  errorText: Locator;

  /**
   * @param {import('playwright').Page} page
   */
  constructor(page: Page) {
    this.page = page;
    this.roomCodeInput = page.getByTestId("roomCodeInput");
    this.playerNameInput = page.getByTestId("playerNameInput");
    this.joinRoomButton = page.getByTestId("joinRoomButton");
    this.hostRoomButton = page.getByTestId("hostRoomButton");
    this.errorText = page.getByTestId("errorText");
  }
}

export { LoginPage };
