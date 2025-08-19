import { Locator, Page } from "@playwright/test";

class HostBuzzerPage {
  page: Page;
  buzzersInfo: Locator;
  buzzerButtons: {
    button: Locator;
  }[];
  buzzersPasswordInput: Locator;
  buzzersSubmitButton: Locator;

  /**
   * @param {import('playwright').Page} page
   */
  constructor(page: Page) {
    this.page = page;
    this.buzzersInfo = page.getByTestId("buzzersInfo");
    this.buzzerButtons = Array.from({ length: 2 }, (_, i) => ({
      button: page.getByTestId(`buzzersButtonTeam${i}`),
    }));
    this.buzzersPasswordInput = page.getByTestId("buzzersPasswordInput");
    this.buzzersSubmitButton = page.getByTestId("buzzersSubmitButton");
  }
}

export { HostBuzzerPage };
