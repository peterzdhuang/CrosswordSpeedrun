export interface CrosswordData {
  grid: string[];
  gridnums: number[];
  size: { cols: number; rows: number };
  clues: {
    across: string[];
    down: string[];
  };
  answers: {
    across: string[];
    down: string[];
  };
}

export interface GridBox {
  letter: string;
  number: number;
  across?: number;
  down?: number;
  isBlocked: boolean;
}

export interface ClueInfo {
  clue: string;
  start: [number, number];
  end: [number, number];
  answer: string;
}

export interface CrosswordGrid {
  grid: GridBox[][];
  acrossStarts: Set<number>;
  downStarts: Set<number>;
  gridSize: number;
}