import { ClueInfo, CrosswordData, CrosswordGrid, GridBox } from '../types/crossword'

export function loadJson(data: CrosswordData): CrosswordGrid {
  const gridSize = data.size.cols;
  const grid: GridBox[][] = [];
  console.log(data)
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

  const gridNums : number[] = data.gridnums;

  // Initialize sets to store clue starts
  const acrossStarts = new Set<number>();
  const downStarts = new Set<number>();

  // Iterate through the grid to find clue starts
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      // Skip black squares
      if (grid[y][x].isBlocked) {
        continue;
      }

      // Check for across clue start
      if (gridNums[y * gridSize + x] > 0 && (x === 0 || grid[y][x-1].isBlocked)) {
        acrossStarts.add(gridNums[y * gridSize + x]);
      }

      // Check for down clue start
      if (gridNums[y * gridSize + x] > 0 && (y === 0 || grid[y-1][x].isBlocked)) {
        downStarts.add(gridNums[y * gridSize + x]);
      }
    }
  }

  return { grid, acrossStarts, downStarts, gridSize };
}
