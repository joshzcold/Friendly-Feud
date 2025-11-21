export interface Host {
  id: string;
}

export interface RegisteredPlayer {
  start: Date;
  latencies: number[];
  team: number | null;
  latency: number;
  name: string;
  hidden: boolean;
}

export const WSAction = {
  ERROR: "error",
  PING: "ping",
  GET_BACK_IN: "get_back_in",
  QUIT: "quit",
  HOST_ROOM: "host_room",
  JOIN_ROOM: "join_room",
  DATA: "data",
  REVEAL: "reveal",
  FINAL_REVEAL: "final_reveal",
  DUPLICATE: "duplicate",
  FINAL_SUBMIT: "final_submit",
  FINAL_WRONG: "final_wrong",
  SET_TIMER: "set_timer",
  STOP_TIMER: "stop_timer",
  START_TIMER: "start_timer",
  CHANGE_LANG: "change_lang",
  TIMER_COMPLETE: "timer_complete",
  CLEARBUZZERS: "clearbuzzers",
  MISTAKE: "mistake",
  SHOW_MISTAKE: "show_mistake",
  BUZZED: "buzzed",
  REGISTERED: "registered",
  REGISTER_BUZZER_SCREEN: "register_buzzer_screen",
  BUZZER_SCREEN_BUZZ: "buzzer_screen_buzz",
  LOAD_GAME: "load_game"
} as const

type WSActionKey = keyof typeof WSAction
type WSActionValue = (typeof WSAction)[WSActionKey]

export interface WSEvent {
  action: WSActionValue;
  message?: string;
  file?: string;
  // TODO: current data and game can mean the same thing to
  // different actions. This would be good to cleanup.

  data?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  game?: Game;
  logoData?: string;
  room?: string;
  name?: string;
  host?: boolean;
  id?: string;
  hostPassword?: string;
  session?: string;
  team?: number;
  mimetype?: string;

  // on WSAction.CHANGE_LANG we get a list of game files back
  // from the server to select for the user.
  games?: string[];

  // Error code
  code?: string;
}

export interface Buzzed {
  time: number;
  id: string;
  // optional value for determining which team buzzed first.
  // used in generic buzzer interface vs. player list.
  team: number;
}

export interface BuzzedState {
  id?: string;
  name?: string;
  team_name?: string;
}

export interface Settings {
  logo_url: string | null;
  hide_questions: boolean;
  theme: string;
  final_round_title: string | null;
  player_buzzer_sound: boolean;
  first_buzzer_sound_only: boolean;
}

export interface SettingsTheme {
  theme: string;
}

export interface Team {
  name: string;
  points: number;
  mistakes: number;
}

export interface Answer {
  trig: boolean;
  ans: string;
  pnt: number;
}

export interface Round {
  answers: Answer[];
  multiply: number;
  question: string;
}

export interface FinalRoundAnswer {
  0: string; // Answer text
  1: number; // Points
  [index: number]: string | number;
}

export interface FinalRound {
  answers: FinalRoundAnswer[];
  question: string;
  selection: number;
  points: number;
  input: string;
  revealed: boolean;
}

export interface GameTheme {
  settings: SettingsTheme;
}

export interface Game {
  // Core properties
  room: string;
  registeredPlayers: Record<string, RegisteredPlayer>;
  host: Host;
  buzzed: Buzzed[];
  settings: Settings;

  // Teams
  teams: Team[];

  // Game state
  title: boolean;
  title_text: string;
  point_tracker: number[];

  // Round management
  round: number;
  rounds: Round[];

  // Final round properties
  is_final_round: boolean;
  is_final_second: boolean;
  hide_first_round: boolean;
  final_round: FinalRound[];
  final_round_2: FinalRound[];
  final_round_timers: number[];

  // Timing properties
  tick: number;
  round_start_time: number;
}
