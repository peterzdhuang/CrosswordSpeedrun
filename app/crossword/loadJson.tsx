import { ClueInfo, CrosswordData, CrosswordGrid, GridBox } from '../types/crossword'

export function loadJson(data: CrosswordData): CrosswordGrid {
  const gridSize = data.size.cols;
  const grid: GridBox[][] = [];
  const across: Record<number, ClueInfo> = {};
  const down: Record<number, ClueInfo> = {};

  // Create 2D grid
  for (let y = 0; y < gridSize; y++) {
    grid[y] = [];
    for (let x = 0; x < gridSize; x++) {
      const index = y * gridSize + x;
      const letter = data.grid[index];
      const number = data.gridnums[index];

      grid[y][x] = {
        letter: letter === '.' ? '' : letter,
        number: number,
        isBlocked: letter === '.'
      };
    }
  }

  // Find across words
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      // Check for across word start
      if ((x === 0 || grid[y][x-1].isBlocked) && !grid[y][x].isBlocked) {
        const number = grid[y][x].number;
        if (number === 0) continue;

        // Measure word length and find end
        let endX = x;
        while (endX < gridSize && !grid[y][endX].isBlocked) {
          // Mark across number for each box in the word
          grid[y][endX].across = number;
          endX++;
        }

        // Find corresponding clue index
        const clueIndex = Object.keys(across).length;
        across[number] = {
          clue: data.clues.across[clueIndex],
          start: [x, y],
          end: [endX - 1, y],
          answer: data.answers.across[clueIndex]
        };
      }
    }
  }

  // Find down words
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      // Check for down word start
      if ((y === 0 || grid[y-1][x].isBlocked) && !grid[y][x].isBlocked) {
        const number = grid[y][x].number;
        if (number === 0) continue;

        // Measure word length and find end
        let endY = y;
        while (endY < gridSize && !grid[endY][x].isBlocked) {
          // Mark down number for each box in the word
          grid[endY][x].down = number;
          endY++;
        }

        // Find corresponding clue index
        const clueIndex = Object.keys(down).length;
        down[number] = {
          clue: data.clues.down[clueIndex],
          start: [x, y],
          end: [x, endY - 1],
          answer: data.answers.down[clueIndex]
        };
      }
    }
  }

  return { grid, across, down, gridSize };
}
