/**
 * Centralized Games TypeScript Types
 * Single source of truth for all game entities
 */

// ============= COMMON GAME TYPES =============

export interface BaseGame {
  id: number;
  title: string;
  description: string;
  created_at: string;
  is_active?: boolean;
}

export interface GameSession {
  id: number;
  user: number;
  started_at: string;
  finished_at?: string;
  score: number;
  feedback?: string;
  season_number?: number;
}

// ============= QUIZ TYPES =============

export interface Answer {
  id: number;
  text: string;
  is_correct: boolean;
  question?: number;
}

export interface Question {
  id: number;
  text: string;
  category?: string;
  difficulty?: string;
  explanation?: string;
  hint?: string;
  is_multi_select?: boolean;
  quiz?: number;
  answers?: Answer[];
  created_at: string;
}

export interface Quiz extends BaseGame {
  category?: string;
  difficulty?: string;
  author_id?: number;
  author_name?: string;
  time_limit?: number;
  is_public?: boolean;
  start_date?: string;
  end_date?: string;
  season_number?: number;
  questions?: Question[];
}

export interface QuizSession extends GameSession {
  quiz: number;
}

export interface UserAnswer {
  id: number;
  session: number;
  question: number;
  answer: number;
  answered_at: string;
}

export interface QuizSubmission {
  question_id: number;
  answer_id: number;
}

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  correct_answers: number;
  session_id?: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  score: number;
  time_taken?: number;
  completed_at: string;
}

// ============= ASSOCIATION TYPES =============

export interface AssociationPair {
  id: number;
  left_item: string;
  right_item: string;
  association: number;
}

export interface Association extends BaseGame {
  category?: string;
  difficulty?: string;
  time_limit?: number;
  pairs?: AssociationPair[];
}

export interface AssociationSession extends GameSession {
  association: number;
  matches: Record<string, string>;
  time_taken: number;
}

export interface AssociationSubmission {
  matches: Record<string, string>;
  time_taken: number;
}

// ============= CROSSWORDS TYPES =============

export interface CrosswordClue {
  id: number;
  number: number;
  clue: string;
  answer: string;
  length: number;
  direction?: 'across' | 'down';
  row?: number;
  col?: number;
  crossword?: number;
}

export interface Crossword extends BaseGame {
  category?: string;
  difficulty?: string;
  grid_size?: number;
  time_limit?: number;
  clues?: CrosswordClue[];
}

export interface CrosswordSession extends GameSession {
  crossword: number;
  answers: Record<string, string>;
  time_taken: number;
}

export interface CrosswordSubmission {
  answers: Record<string, string>;
  time_taken: number;
}

// ============= SIMULATOR TYPES =============

export interface Simulator extends BaseGame {
  scenario_type?: string;
  difficulty?: string;
  parameters?: any;
  scenario?: string;
  created_by?: number;
  config?: any;
  game_id?: number;
}

export interface SimulatorSession extends GameSession {
  simulator: number;
  input_data: any;
  result_data: any;
}

export interface SimulatorSubmission {
  input_data: any;
}

export interface SimulatorResult {
  session_id: number;
  result: any;
  feedback?: string;
}

// ============= API RESPONSE TYPES =============

export interface GamesApiResponse<T> {
  results?: T[];
  count?: number;
  success?: boolean;
  data?: T | T[];
  message?: string;
  leaderboard?: LeaderboardEntry[];
}
