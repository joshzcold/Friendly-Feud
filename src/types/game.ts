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

export interface Buzzed {
  time: number;
  id: string;
}

export interface BuzzedState {
  id?: string;
  name?: string;
  team?: string;
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
