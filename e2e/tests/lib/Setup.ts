import type { Browser, BrowserContext, Page } from "@playwright/test";
import { AdminPage } from "../models/AdminPage.js";
import { BuzzerPage } from "../models/BuzzerPage.js";
import { LoginPage } from "../models/LoginPage.js";

export enum PlayerType {
  BUZZER = 1,
  SPECTATOR = 2,
  HOST_BUZZER = 3,
}


class Player {
  context!: BrowserContext;
  page!: Page;
  name!: string;
  team!: number
}

export class Setup {
  private browser: Browser;
  private clients!: { host: { context: BrowserContext; page: Page }; players: Player[] };
  private currentTeam: number;
  public roomCode: string | null;

  /**
   * @param {import('playwright').Browser} browser
   */
  constructor(browser: Browser) {
    this.browser = browser;
    this.currentTeam = 0;
    this.roomCode = null;
  }

  async host(): Promise<{ page: Page }> {
    const hostContext = await this.browser.newContext();
    this.clients.host = {
      context: hostContext,
      page: await hostContext.newPage(),
    };
    await this.clients.host.page.goto("/", { waitUntil: "domcontentloaded", timeout: 10000 });
    this.roomCode = await this.hostRoom(this.clients.host.page);
    return this.clients.host;
  }

  /**
   * @returns {
   *  newPlayerObj {any}
   * }
   */
  async addPlayer(playerType: PlayerType = PlayerType.BUZZER): Promise<{ page: Page; name: string; team: number }> {
    const newPlayerContext = await this.browser.newContext();
    const newPlayerName = this.clients.players.length;
    const newPlayerObj = {
      context: newPlayerContext,
      page: await newPlayerContext.newPage(),
      name: `Player ${newPlayerName}`,
      team: this.currentTeam,
    };

    this.clients.players.push(newPlayerObj);
    // flip the current team.
    this.currentTeam = 1 - this.currentTeam;
    await newPlayerObj.page.goto("/", { waitUntil: "domcontentloaded", timeout: 10000 });
    if (playerType == PlayerType.SPECTATOR) {
      await this.joinRoomSpectator(newPlayerObj.page, newPlayerObj.name);
    } else if (playerType === PlayerType.BUZZER) {
      await this.joinRoom(newPlayerObj.page, newPlayerObj.team, newPlayerObj.name);
    } else if (playerType === PlayerType.HOST_BUZZER) {
      await this.joinRoomHostBuzzer(newPlayerObj.page, newPlayerObj.name);
    }

    return newPlayerObj;
  }

  async hostRoom(page: Page): Promise<string> {
    const loginPage = new LoginPage(page);
    await loginPage.hostRoomButton.click();
    const adminPage = new AdminPage(page);
    const roomCode = await adminPage.roomCodeText.innerText();
    // Type in lowercase to make sure client/server handles case correctly
    return roomCode;
  }

  async joinRoom(page: Page, teamNumber: number, playerName: string) {
    const bp = new BuzzerPage(page);
    const loginPage = new LoginPage(page);
    await loginPage.roomCodeInput.fill(this.roomCode as string);
    await loginPage.playerNameInput.fill(playerName);
    await loginPage.joinRoomButton.click();
    if (teamNumber === 0) {
      await bp.joinTeam1.click();
    } else if (teamNumber === 1) {
      await bp.joinTeam2.click();
    }
    await bp.registerBuzzerButton.click();
  }

  /**
   * @param {import('playwright').Page} page
   * @param {string} playerName
   */
  async joinRoomSpectator(page: Page, playerName: string) {
    const bp = new BuzzerPage(page);
    const loginPage = new LoginPage(page);
    await loginPage.roomCodeInput.fill(this.roomCode as string);
    await loginPage.playerNameInput.fill(playerName);
    await loginPage.joinRoomButton.click();
    await bp.openGameWindowButton.click();
  }
  async joinRoomHostBuzzer(page: Page, playerName: string) {
    const bp = new BuzzerPage(page);
    const loginPage = new LoginPage(page);
    await loginPage.roomCodeInput.fill(this.roomCode as string);
    await loginPage.playerNameInput.fill(playerName);
    await loginPage.joinRoomButton.click();
    await bp.hostBuzzersWindowButton.click();
  }
}
