export type CandyColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

export type SpecialType = 'none' | 'striped_h' | 'striped_v' | 'wrapped' | 'color_bomb';

export interface CandyTile {
  id: string;
  color: CandyColor;
  special: SpecialType;
  row: number;
  col: number;
  isMatched?: boolean;
  isHint?: boolean;
  isSwapping?: boolean;
  blastDirection?: 'h' | 'v' | 'both' | 'area';
}

export interface Position {
  row: number;
  col: number;
}

export type GameStatus = 'playing' | 'paused' | 'won' | 'lost' | 'shuffling';

export interface LevelConfig {
  level: number;
  title: string;
  targetScore: number;
  moves: number;
  description: string;
  colorsCount: number;
  starScores: [number, number, number];
}

export interface ComboBanner {
  id: string;
  text: string;
  subtext?: string;
  comboCount: number;
}

export type BoosterType = 'hammer' | 'color_bomb' | 'free_swap';

export interface FloatingScore {
  id: string;
  score: number;
  row: number;
  col: number;
}
