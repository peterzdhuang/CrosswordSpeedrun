// Define types for our crossword data
export type CrosswordWord = {
  word: string
  clue: string
  direction: "across" | "down"
  startRow: number
  startCol: number
}

export type CrosswordData = {
  size: number
  words: CrosswordWord[]
}

// Example crossword data
export const sampleCrosswordData: CrosswordData = {
  size: 5,
  words: [
    { word: "HELLO", clue: "A greeting", direction: "across", startRow: 0, startCol: 0 },
    { word: "EARTH", clue: "Our planet", direction: "down", startRow: 0, startCol: 0 },
    { word: "LASER", clue: "Focused light beam", direction: "across", startRow: 2, startCol: 0 },
    { word: "OCEAN", clue: "Vast body of water", direction: "down", startRow: 0, startCol: 4 },
    { word: "TRAIN", clue: "Rail transport", direction: "across", startRow: 4, startCol: 0 },
  ],
}

